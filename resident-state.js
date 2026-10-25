// 對話只存在這次瀏覽工作階段，不傳送輸入，也不影響人生任務存檔。
function person(list,id){const value=list.find(r=>r.id===id);if(!value)throw new RangeError('找不到這位居民。');return value;}
export function currentNode(list,state){const resident=person(list,state.residentId);const node=Object.hasOwn(resident.nodes,state.nodeId)?resident.nodes[state.nodeId]:null;if(!node)throw new RangeError('找不到這段對話。');return node;}
export function createConversation(list,id){const resident=person(list,id),node=resident.nodes[resident.start];if(!node)throw new RangeError('這位居民尚未準備好開場。');return {residentId:id,nodeId:resident.start,turns:node.lines.map(text=>({speaker:'resident',text})),history:[]};}
export function chooseReply(list,state,choiceId){
 const node=currentNode(list,state),choice=node.choices.find(c=>c.id===choiceId);
 if(!choice)throw new RangeError('請選擇畫面上的回覆。');
 if(!Array.isArray(state.turns)||!Array.isArray(state.history)||state.history.length>=24)throw new RangeError('這段對話先聊到這裡，可以重新聊聊。');
 const next=currentNode(list,{residentId:state.residentId,nodeId:choice.next});
 return {residentId:state.residentId,nodeId:choice.next,turns:[...state.turns.map(t=>({...t})),{speaker:'visitor',text:choice.label},...next.lines.map(text=>({speaker:'resident',text}))],history:[...state.history.map(h=>({...h})),{nodeId:state.nodeId,choiceId,turnCount:state.turns.length}]};
}
