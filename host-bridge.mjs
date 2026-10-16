/** Use the host's shared model-selection service without its menu-close callback. */
export function createEffortCommitter(scope, d) {
  return async request => {
    const sessionId=scope.uiWorkspace.mainReference?.sessionId;
    if (!sessionId || scope.sessions.subagentAddress(sessionId)!==undefined || d.querySelectorAll('.wq12jW_trigger').length!==1) return {handled:false};
    const directory=scope.modelDirectories.directoryFor(sessionId);
    const snapshot=directory.store.getSnapshot(), current=snapshot.current;
    if (!current) return {handled:false};
    const model=snapshot.groups.find(group=>group.id===current.provider)?.models.find(model=>model.id===current.model);
    const reasoning=model?.reasoning;
    if (!reasoning || !Array.isArray(reasoning.efforts)) return {handled:false};
    const offset=reasoning.defaultEffort===undefined?1:0;
    if (request.labels.length!==reasoning.efforts.length+offset || reasoning.efforts.some((level,i)=>level.name!==request.labels[i+offset]) || !Number.isInteger(request.index) || request.index<0 || request.index>=request.labels.length) return {handled:false};
    const effort=request.index<offset?undefined:reasoning.efforts[request.index-offset].id;
    const selection={provider:current.provider,model:current.model,...effort===undefined?{}:{reasoningEffort:effort}};
    const result=await directory.select(selection);
    return {handled:true,ok:result.ok};
  };
}
