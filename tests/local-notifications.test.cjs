const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

async function service(granted) {
 const {buildPhoneNotificationContent}=await import('../mobile/notificationTheme.js');
 const calls={scheduled:[],requests:0,channels:[],cleared:0};
 const context={buildPhoneNotificationContent,console:{warn(){}},AppState:{currentState:'active'},Platform:{OS:'android'},AndroidImportance:require('expo-notifications/build/NotificationChannelManager.types.js').AndroidImportance,
  getPermissionsAsync:async()=>({granted,status:granted?'granted':'denied',canAskAgain:false}),
  requestPermissionsAsync:async()=>{calls.requests++;return {granted:true,status:'granted'};},
  setNotificationChannelAsync:async(...args)=>calls.channels.push(args),
  setNotificationHandler:handler=>calls.handler=handler,
  scheduleNotificationAsync:async notice=>calls.scheduled.push(notice),
  getPresentedNotificationsAsync:async()=>[
    {request:{identifier:'bean',content:{data:{beancraft:true}}}},
    {request:{identifier:'other',content:{data:{}}}}
  ],
  dismissNotificationAsync:async id=>{assert.equal(id,'bean');calls.cleared++;},
  addNotificationResponseReceivedListener:callback=>{calls.onPress=callback;return {remove(){calls.removed=true;}};},
  getLastNotificationResponse:()=>null,clearLastNotificationResponse(){}
 };
 const code=fs.readFileSync('mobile/localNotifications.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
 vm.runInNewContext(code+'\nglobalThis.api={presentLocalNotification,notificationPermission,clearPhoneNotices,listenForNotificationPress,notificationErrorDetails};',context);
 return {calls,context,api:context.api};
}

test('el aviso del teléfono aparece también en primer plano, con sonido y en la bandeja',async()=>{
 const {calls,context,api}=await service(true);
 await api.presentLocalNotification({id:'n1',title:'Listo',body:'Pasa por él.',view:'orders'});
 assert.equal(calls.channels.length,1);
 assert.match(calls.channels[0][1].name,/BeanCraft/);
 assert.equal(calls.scheduled[0].content.title,'BeanCraft · Listo');
 assert.equal(calls.scheduled[0].trigger.channelId,'beancraft-avisos');
 const foreground=await calls.handler.handleNotification();
 assert.equal(foreground.shouldShowBanner,true);
 assert.equal(foreground.shouldPlaySound,true);
 assert.equal(foreground.shouldShowList,true);
 context.AppState.currentState='background';assert.equal((await calls.handler.handleNotification()).shouldShowBanner,true);
 const views=[];const remove=api.listenForNotificationPress(view=>views.push(view));
 calls.onPress({notification:{request:{content:{data:{beancraft:true,view:'orders'}}}}});assert.deepEqual(views,['orders']);
 remove();assert.equal(calls.removed,true);await api.clearPhoneNotices();assert.equal(calls.cleared,1);
});

test('permiso denegado: no programar avisos ni insistir con otra solicitud',async()=>{
 const {calls,api}=await service(false);
 assert.equal((await api.presentLocalNotification({id:'n2',title:'Hola',body:'BeanCraft',view:'home'})).status,'denied');
 assert.equal(calls.scheduled.length,0);assert.equal(calls.requests,0);
});

test('una denegación no vuelve a solicitar permiso por cada aviso',async()=>{
 const {calls,context,api}=await service(false);
 const denied={granted:false,status:'denied',canAskAgain:true};
 context.getPermissionsAsync=async()=>denied;
 context.requestPermissionsAsync=async()=>{calls.requests++;return denied;};
 await api.presentLocalNotification({id:'a',title:'Hola',body:'BeanCraft',view:'home'});
 await api.presentLocalNotification({id:'b',title:'Hola',body:'BeanCraft',view:'home'});
 assert.equal(calls.requests,1);assert.equal(calls.scheduled.length,0);
});

test('avisos del teléfono: validar y acotar contenido y navegación',async()=>{
 const {notificationPayload}=await import('../lib/notification-payload.js');
 assert.equal(notificationPayload({title:1,body:'hola'},'id'),null);
 const p=notificationPayload({title:'a'.repeat(100),body:'b'.repeat(300),view:'admin',mascot:'invalid'},'id');
 assert.equal(p.title.length,80);assert.equal(p.body.length,240);assert.equal(p.view,'home');assert.equal(p.mascot,'taza');
});

test('permiso concedido: un error al crear el canal no se confunde con falta de permiso',async()=>{
 const {calls,context,api}=await service(true);
 context.setNotificationChannelAsync=async()=>{throw new Error('Canal personalizado no disponible');};
 assert.equal((await api.notificationPermission()).status,'granted');
 const result=await api.presentLocalNotification({id:'fallback',title:'Prueba',body:'BeanCraft',view:'home'});
 assert.equal(result.status,'granted');assert.equal(result.delivery,'scheduled');assert.equal(result.channelMode,'default');
 assert.equal(calls.scheduled[0].trigger,null);assert.match(result.channelWarning,/Canal personalizado/);
});

test('Expo Go: reintentar un envío incompatible con el canal predeterminado inmediato',async()=>{
 const {calls,context,api}=await service(true);
 context.scheduleNotificationAsync=async notice=>{calls.scheduled.push(notice);if(notice.trigger)throw new Error('Trigger de canal no disponible');};
 const result=await api.presentLocalNotification({id:'fallback',title:'Prueba',body:'BeanCraft',view:'home'});
 assert.equal(calls.scheduled.length,2);assert.equal(calls.scheduled[1].trigger,null);
 assert.equal(result.channelMode,'default');assert.equal(result.delivery,'scheduled');
});

test('errores reales: conservar etapa, mensaje y código del sistema',async()=>{
 const {context,api}=await service(true);
 context.scheduleNotificationAsync=async()=>{const error=new Error('El servicio nativo no pudo publicar');error.code='ERR_ANDROID_SCHEDULE';throw error;};
 let captured;
 try { await api.presentLocalNotification({id:'error',title:'Prueba',body:'BeanCraft',view:'home'}); }
 catch(error){captured=api.notificationErrorDetails(error);}
 assert.equal(captured.stage,'schedule');assert.equal(captured.code,'ERR_ANDROID_SCHEDULE');assert.equal(captured.message,'El servicio nativo no pudo publicar');
 const second=await service(true);second.context.getPermissionsAsync=async()=>{throw new Error('Permiso no disponible en este runtime');};
 await assert.rejects(second.api.notificationPermission(),error=>error.notificationStage==='permission-read');
});


test('la firma sigue a la mascota del aviso y conserva el mensaje y su destino',async()=>{
 const {calls,api}=await service(true);
 const {FOOTER_QUOTES}=await import('../data/experience.js');
 for (const mascot of ['grano','taza','espuma','hielito','croissant']) {
  await api.presentLocalNotification({id:mascot,title:'Tu pedido',body:'Pedido #123: pasa por él.',view:'orders',mascot});
  const content=calls.scheduled.at(-1).content;
  assert.equal(content.body,'Pedido #123: pasa por él.');
  assert.equal(content.data.view,'orders');assert.equal(content.data.mascot,mascot);
  assert.ok(content.subtitle.includes(FOOTER_QUOTES.find(f=>f.id===mascot).quote.replace(/^Y recuerda… /,'')));
  assert.equal(content.color,'#0B5C63');
 }
 const second=await service(true);
 second.context.setNotificationChannelAsync=async()=>{throw new Error('Canal no disponible');};
 await second.api.presentLocalNotification({id:'fallback',title:'Listo',body:'Pasa por él.',view:'orders',mascot:'espuma'});
 assert.match(second.calls.scheduled[0].content.subtitle,/Espuma/);
 assert.equal(second.calls.scheduled[0].content.data.mascot,'espuma');
});

test('el icono de Android usa solo blanco y transparencia y la mascota existe',async()=>{
 const {getPngInfo}=require('@expo/image-utils');
 const config=JSON.parse(fs.readFileSync('app.json','utf8')).expo;
 const plugin=config.plugins.find(p=>Array.isArray(p)&&p[0]==='expo-notifications')[1];
 const icon=await getPngInfo(plugin.icon);
 assert.equal(icon.width,96);assert.equal(icon.height,96);
 let transparent=0,opaque=0;
 for(let i=0;i<icon.data.length;i+=4){
  if(icon.data[i+3]===0)transparent++;
  else {opaque++;assert.equal(icon.data[i],255);assert.equal(icon.data[i+1],255);assert.equal(icon.data[i+2],255);}
 }
 assert.ok(transparent>0&&opaque>0);
 assert.ok(fs.existsSync(plugin.largeIcon));
});
