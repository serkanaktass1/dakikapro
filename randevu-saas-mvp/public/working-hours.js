/* Business working hours: set once in the panel, use everywhere customers book. */
const dakikaProHours = value => {
  const found=String(value||'').match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  return found?{start:found[1].padStart(5,'0'),end:found[2].padStart(5,'0')}:{start:'09:00',end:'19:00'};
};
const dakikaProTimeSlots = ({start,end}) => {
  const toMinutes=value=>{const [hour,minute]=value.split(':').map(Number);return hour*60+minute};
  const format=value=>`${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`;
  const slots=[];for(let time=toMinutes(start);time<toMinutes(end);time+=30)slots.push(format(time));return slots;
};
function improveWorkingHoursForm(){
  if(location.hash!=='#business'||view!=='businessSettings'||!ownerSession)return;
  const original=document.querySelector('input[name="workingHours"]');
  if(!original||original.dataset.dakikaHours)return;
  original.dataset.dakikaHours='true';original.type='hidden';
  const values=dakikaProHours(original.value);
  const wrapper=document.createElement('div');wrapper.className='field full';wrapper.dataset.workingHoursEditor='true';
  wrapper.innerHTML=`<span>Randevu saatleri <small class="sub">Müşteriler yalnızca bu saat aralığından randevu seçebilir.</small></span><div class="hoursEditor"><label>Açılış<input required type="time" name="bookingStart" value="${values.start}"></label><span>—</span><label>Kapanış<input required type="time" name="bookingEnd" value="${values.end}"></label></div>`;
  original.closest('label')?.insertAdjacentElement('afterend',wrapper);
}
document.addEventListener('submit',event=>{
  const form=event.target;
  if(!form?.querySelector?.('input[name="bookingStart"]'))return;
  const start=form.elements.bookingStart?.value,end=form.elements.bookingEnd?.value,original=form.elements.workingHours;
  if(!start||!end||start>=end){event.preventDefault();toast('Kapanış saati açılış saatinden sonra olmalı.');return;}
  if(original)original.value=`Her gün, ${start}–${end}`;
},true);
async function applyWorkingHoursToBooking(){
  const form=document.querySelector('.bookingform form');
  if(!form||form.dataset.dakikaHoursReady)return;
  const slug=location.hash.startsWith('#book/')?decodeURIComponent(location.hash.slice(6)):'';
  if(!slug)return;
  const staff=form.querySelector('[name="staffId"]'),date=form.querySelector('[name="date"]'),time=form.querySelector('[name="time"]');
  if(!staff||!date||!time)return;
  form.dataset.dakikaHoursReady='true';
  try{
    const response=await fetch(`/data/public/${encodeURIComponent(slug)}`,{cache:'no-store'}),data=await response.json();
    if(!response.ok)throw Error();
    const slots=dakikaProTimeSlots(dakikaProHours(data.tenant?.workingHours));const busy=data.busySlots||[];
    const refresh=()=>{const previous=time.value;time.innerHTML=slots.map(slot=>{const occupied=busy.some(item=>item.staffId===staff.value&&item.date===date.value&&item.time===slot);return `<option value="${slot}" ${occupied?'disabled hidden':''}>${slot}${occupied?' · Dolu':''}</option>`}).join('');if([...time.options].some(option=>option.value===previous&&!option.disabled))time.value=previous;};
    staff.addEventListener('change',refresh);date.addEventListener('change',refresh);refresh();
  }catch(_){form.dataset.dakikaHoursReady='';}
}
setInterval(()=>{improveWorkingHoursForm();applyWorkingHoursToBooking();},250);
