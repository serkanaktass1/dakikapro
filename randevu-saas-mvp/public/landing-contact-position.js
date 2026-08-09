/* Keep the contact area at the bottom of the landing page, outside the top navigation flow. */
(function(){
  function place(){
    const landing=document.querySelector('.landing,.dakikaproLanding'),main=landing?.querySelector('main'),contact=main?.querySelector('#contact');
    if(!main||!contact||contact.dataset.bottomPlaced)return;
    contact.dataset.bottomPlaced='true';main.append(contact);
  }
  setInterval(place,300);
})();
