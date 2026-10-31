/** Bounded correction; persisted phases prevent a lost response from duplicating an image call. */
function streetPrompt105_(j){
 return 'Retexture the attached 3D street view as a full-color historical visualization of year '+j.plan.sceneYear+'. Treat the input as the fixed canvas, not a reference for a new composition. Keep all visible geometry and empty spaces at exactly the same pixel positions: camera, perspective, building silhouettes, rooflines, walls, roads and intersections. Apply modest surface texture and lighting within the existing shapes. Preserve the simplified flat blocks when details are unknown. Do not construct stairs, porches, extensions, roofs, shop rows or any new architectural volume. Empty land must stay empty. Keep black padding unchanged. The original composition takes priority over realism. Add only a few small people for requested activity, on already visible ground, without covering structural corners.\nVisitor details (not historical evidence): '+JSON.stringify(j.plan.description)+'\nSource-linked surface evidence: '+JSON.stringify(j.materialEvidence||[])+'\nNO archival-verified signs are authorized by default. Plain blank boards are allowed. No readable letters, numerals, logos, street names or shop names except exact signText in the authorized circles below. Output one full-color image, with no caption, UI or annotation marks.'+streetNotePrompt104_(j);
}
function streetGenerate105_(rec,view,candidate,model){
 const j=rec.data,p=PropertiesService.getScriptProperties(),key=p.getProperty('GEMINI_API_KEY');
 const correction=!!candidate;if((j.attempt||0)>=(correction?2:1))throw new Error('UNCERTAIN');
 generationLimit_('RENDER');j.attempt=(j.attempt||0)+1;j.status='SUBMITTING';j.errorCode=null;j.startedAt=new Date().toISOString();j.imageModel=model;j.renderPrompt=streetPrompt105_(j);rec.file.setContent(JSON.stringify(j));
 const parts=[{text:j.renderPrompt},{text:'IMAGE A: original immutable viewport. Edit THIS canvas.'},{inlineData:{mimeType:view.mime,data:view.data}}];
 if(correction){parts.push({text:'Only the original viewport is attached. An earlier attempt was rejected. Redo the surface edit on the original viewport only. Remove the following errors; simplify surface detail where needed instead of inventing architecture: '+JSON.stringify(streetReviewDetails104_(j.validation))+' Original measured visible-building bounding boxes (normalized to IMAGE A, not drawing instructions): '+JSON.stringify(j.sourceLandmarks||[])+' Copy the image-A geometry exactly, including small distant masses. Remove all diagram or annotation strokes, including white circles. Keep people small and only on the original ground.'});}
 let res,body;
 try{res=UrlFetchApp.fetch(API_ORIGIN_+'/v1beta/models/'+encodeURIComponent(model)+':generateContent',{method:'post',contentType:'application/json',headers:{'x-goog-api-key':key},payload:JSON.stringify({contents:[{role:'user',parts:parts}],generationConfig:{responseModalities:['TEXT','IMAGE'],imageConfig:{aspectRatio:streetAspect102_(j.camera.aspect),imageSize:'1K'}}}),muteHttpExceptions:true,followRedirects:false});body=JSON.parse(res.getContentText());}
 catch(_){j.status='UNCERTAIN';j.errorCode='UNCERTAIN';rec.file.setContent(JSON.stringify(j));throw new Error('UNCERTAIN');}
 if(res.getResponseCode()!==200){j.status='FAILED';j.errorCode=renderHttpCode_(res.getResponseCode(),body);rec.file.setContent(JSON.stringify(j));throw new Error(j.errorCode);}
 const im=renderImagePart_(body);if(!im){j.status='FAILED';j.errorCode=body.promptFeedback?.blockReason?'RENDER_BLOCKED':'RENDER_NO_IMAGE';rec.file.setContent(JSON.stringify(j));throw new Error(j.errorCode);}
 const bytes=Utilities.base64Decode(im.data);if(bytes.length>15000000)throw new Error('IMAGE_SIZE');
 const file=generationFolder_().createFile(Utilities.newBlob(bytes,im.mime,j.token+'_attempt'+j.attempt+'.'+(im.mime==='image/png'?'png':im.mime==='image/webp'?'webp':'jpg')));
 j.candidateFile=file.getId();j.attempts=j.attempts||[];j.attempts.push({attempt:j.attempt,imageFile:j.candidateFile,model:model,createdAt:new Date().toISOString()});j.status='REVIEW_PENDING';j.errorCode=null;rec.file.setContent(JSON.stringify(j));return streetPublic102_(j);
}
function advanceStreetScene105(request){
 const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return streetError102_(new Error('BUSY'),request?.token);let rec;
 try{
  rec=loadJob_(request?.token);const j=rec.data;if(j.kind!=='street_scene'||j.policyVersion!==105)throw new Error('NOT_FOUND');
  if(j.status==='SUCCEEDED')return getStreetScene102(j.token);
  if(!['REVIEW_PENDING','REPAIR_PENDING'].includes(j.status))return streetPublic102_(j);
  const view=renderView_(j.viewFile),candidate=renderView_(j.candidateFile);
  if(j.status==='REPAIR_PENDING'){
   // A correction is a separate, known request. Never repeat an uncertain submission.
   const model=PropertiesService.getScriptProperties().getProperty('GEMINI_CORRECTION_MODEL')||'gemini-3-pro-image';
   if(!/^gemini-[a-z0-9.-]+$/.test(model))throw new Error('RENDER_MODEL');
   return streetGenerate105_(rec,view,candidate,model);
  }
  j.reviewCalls=(j.reviewCalls||0)+1;rec.file.setContent(JSON.stringify(j));
  try{if(!j.sourceLandmarks?.every(r=>streetBox105_(r.box))){j.sourceLandmarks=streetLandmarks105_(view);rec.file.setContent(JSON.stringify(j));}const measured=streetMeasureCandidate105_(j,candidate);j.validation=streetReview103_(j,view,candidate);j.validation.independentMeasurement=measured;let resolved=measured;if(j.validation.approved&&!measured.approved){resolved=streetResolveBounds105_(j,view,candidate,measured);j.validation.correspondenceReview=resolved;}j.validation.approved=j.validation.approved&&resolved.approved;j.validation.maxAnchorError=resolved.maxAnchorError;j.validation.anchors=resolved.anchors;if(!resolved.approved)j.validation.issues.push('Building extents do not match the original viewport.');}catch(_){j.errorCode='REVIEW_UNAVAILABLE';rec.file.setContent(JSON.stringify(j));return Object.assign(streetError102_(new Error(j.errorCode),j.token),{resumable:true});}
  j.attempts[j.attempts.length-1].validation=j.validation;j.errorCode=null;
  if(j.validation.approved){j.imageFile=j.candidateFile;j.status='SUCCEEDED';j.completedAt=new Date().toISOString();rec.file.setContent(JSON.stringify(j));streetIndex102_(j);return getStreetScene102(j.token);}
  if(j.attempt<2&&generationAllowance_('RENDER').remaining>0){j.status='REPAIR_PENDING';rec.file.setContent(JSON.stringify(j));return streetPublic102_(j);}
  j.status='WITHHELD';j.errorCode='VIEW_REJECTED';if(j.attempt<2)j.gaps.push('The daily allowance prevented a correction attempt.');rec.file.setContent(JSON.stringify(j));return streetPublic102_(j);
 }catch(e){return streetError102_(e,rec?.data.token||request?.token);}finally{lock.releaseLock();}
}
