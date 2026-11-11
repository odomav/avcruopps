export function formatPhone(value){
  const digits=String(value||'').replace(/\D/g,'');
  if(!digits)return '';
  const us=digits.length<=10?digits:digits.startsWith('1')?digits.slice(1):null;
  if(us!==null&&us.length<=10){
    if(us.length<=3)return `+1 (${us}`;
    if(us.length<=6)return `+1 (${us.slice(0,3)}) ${us.slice(3)}`;
    return `+1 (${us.slice(0,3)}) ${us.slice(3,6)}-${us.slice(6,10)}`;
  }
  return `+${digits.slice(0,15)}`;
}

export function bindPhone(input){
  if(!input)return;
  input.value=formatPhone(input.value);
  input.addEventListener('input',()=>{input.value=formatPhone(input.value)});
}
