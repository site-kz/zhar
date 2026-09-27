'use strict';
// Настройки ресторана. Номер WhatsApp — только цифры, с кодом страны.
const CONFIG = { name: 'ЖАР', whatsapp: '77766632330', storageKey: 'zhar-cart-v1' };
// [Название, цена ₸, вес/объём, состав, категория, лист фотографий, ячейка, метка]
const RAW_MENU = [
['Классик чиз',1990,'280 г','Говядина, чеддер, томаты, салат, лук, фирменный соус','Бургеры','a',0,'ХИТ'],
['Криспи чикен',1790,'270 г','Хрустящая курица, салат, томаты, чесночный соус','Бургеры','a',1,''],
['Двойной чиз',2690,'390 г','Две говяжьи котлеты, двойной чеддер, томаты, салат, лук','Бургеры','a',2,'ДВОЙНОЙ ВКУС'],
['Смоки BBQ',2390,'320 г','Говядина, луковые кольца, томаты, салат, соус барбекю','Бургеры','a',3,''],
['Острый чикен',1990,'290 г','Хрустящая курица, халапеньо, томаты, салат, острый соус','Бургеры','a',4,'ОСТРО'],
['Грибной чиз',2390,'310 г','Говядина, шампиньоны, сыр, томаты, салат, сливочный соус','Бургеры','a',5,''],
['Донер с курицей',1790,'350 г','Пита, курица, томаты, капуста, лук, чесночный соус','Донеры','a',6,'ХИТ'],
['Донер с говядиной',2190,'350 г','Пита, говядина, томаты, капуста, лук, фирменный соус','Донеры','a',7,''],
['Сырный донер',1990,'380 г','Пита, курица, сыр, томаты, капуста, сырный соус','Донеры','a',8,''],
['Шаурма классик',1690,'330 г','Лаваш, курица, томаты, огурцы, капуста, лук, чесночный соус','Шаурма','b',0,''],
['Шаурма с говядиной',2090,'350 г','Лаваш, говядина, томаты, огурцы, капуста, лук, фирменный соус','Шаурма','b',1,''],
['Шаурма огонь',1890,'340 г','Лаваш, курица, халапеньо, томаты, капуста, острый соус','Шаурма','b',2,'ОСТРО'],
['Картофель фри',790,'150 г','Золотистая картошка с солью','Закуски','b',3,''],
['Картофельные дольки',890,'180 г','Картофель в кожуре с пряностями','Закуски','b',4,''],
['Наггетсы',1190,'6 шт.','Куриное филе в хрустящей панировке','Закуски','b',5,''],
['Крылышки',1590,'5 шт.','Куриные крылышки в пряной панировке','Закуски','b',6,''],
['Луковые кольца',890,'8 шт.','Лук в золотистой хрустящей панировке','Закуски','b',7,''],
['Сырные палочки',1390,'5 шт.','Тягучая моцарелла в хрустящей панировке','Закуски','b',8,''],
['Coca-Cola',590,'330 мл','Классическая кола в банке','Напитки','c',0,''],
['Sprite',590,'330 мл','Лимон и лайм. Напиток в банке','Напитки','c',1,''],
['Fanta',590,'330 мл','Апельсиновый напиток в банке','Напитки','c',2,''],
['Вода',390,'500 мл','Питьевая вода без газа','Напитки','c',3,''],
['Ягодный лимонад',790,'400 мл','Ягоды, лёд и освежающая газированная вода','Напитки','c',4,''],
['Сырный соус',250,'30 г','Нежный соус со вкусом сыра','Соусы','c',5,''],
['Барбекю',250,'30 г','Томатный соус с дымными нотами','Соусы','c',6,''],
['Чесночный соус',250,'30 г','Сливочная основа, чеснок и зелень','Соусы','c',7,''],
['Кетчуп',200,'30 г','Классический томатный соус','Соусы','c',8,'']
];
const MENU = RAW_MENU.map((r,id)=>({id,name:r[0],price:r[1],weight:r[2],description:r[3],category:r[4],sheet:r[5],cell:r[6],badge:r[7]}));
const EXTRAS = [{id:'cheese',name:'Экстра сыр',price:250},{id:'fried-onion',name:'Жареный лук',price:150},{id:'jalapeno',name:'Халапеньо',price:200}];
const $ = s => document.querySelector(s);
const money = n => new Intl.NumberFormat('ru-RU').format(n)+' ₸';
const escapeHTML = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const food = (p,cls='') => `<div class="food ${cls}" role="img" aria-label="${escapeHTML(p.name)}" style="--sheet:url('menu-${p.sheet}.png');--x:${p.cell%3*50}%;--y:${Math.floor(p.cell/3)*50}%"></div>`;
let cart=[];
try { const saved=JSON.parse(localStorage.getItem(CONFIG.storageKey)||'[]'); if(Array.isArray(saved)) cart=saved.map(i=>i&&typeof i==='object'?{...i,extras:Array.isArray(i.extras)?i.extras.filter(x=>x!=='tomato'):i.extras}:i).filter(i=>i&&MENU[i.id] && Number.isInteger(i.qty)&&i.qty>0&&i.qty<=99&&Array.isArray(i.extras)&&i.extras.every(x=>EXTRAS.some(e=>e.id===x))&&Array.isArray(i.removed)&&i.removed.every(x=>removals(MENU[i.id]).includes(x))).map(i=>({id:i.id,qty:i.qty,extras:[...new Set(i.extras)],removed:[...new Set(i.removed)]})); } catch(e) { cart=[]; }
let selected=null, quantity=1, toastTimer;
function removals(p){const result=[];if(/лук/i.test(p.description)&&p.category!=='Закуски')result.push('Без лука');if(/томат/i.test(p.description))result.push('Без томатов');if(/огурц/i.test(p.description))result.push('Без огурцов');if(/соус/i.test(p.description)&&!['Соусы','Напитки'].includes(p.category))result.push('Без соуса');return result;}
function customizable(p){return ['Бургеры','Донеры','Шаурма'].includes(p.category);}
function itemPrice(i){return MENU[i.id].price+i.extras.reduce((s,id)=>s+EXTRAS.find(e=>e.id===id).price,0);}
function itemKey(i){return JSON.stringify([i.id,[...i.extras].sort(),[...i.removed].sort()]);}
function total(){return cart.reduce((s,i)=>s+itemPrice(i)*i.qty,0);}
function notify(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600);}
function showDialog(dialog){dialog.showModal();document.body.classList.add('modal-open');}
function saveCart(){try{localStorage.setItem(CONFIG.storageKey,JSON.stringify(cart));}catch(e){}renderCart();const button=$('#open-cart');button.classList.remove('bump');void button.offsetWidth;button.classList.add('bump');}
function addItem(item){const old=cart.find(i=>itemKey(i)===itemKey(item));if(old)old.qty=Math.min(99,old.qty+item.qty);else cart.push(item);saveCart();}
function renderMenu(category='Всё меню'){
 const filtered=MENU.filter(p=>category==='Всё меню'||p.category===category);
 $('#menu-grid').innerHTML=filtered.map((p,index)=>`<article class="card" style="animation-delay:${Math.min(index,7)*35}ms">${p.badge?`<span class="badge ${p.badge==='ДВОЙНОЙ ВКУС'?'black':''}">${p.badge}</span>`:''}<button class="photo-button" data-product="${p.id}" aria-label="Открыть ${p.name}">${food(p)}</button><div class="card-body"><button class="title-button" data-product="${p.id}"><h3>${p.name}</h3></button><p>${p.description}</p><div class="card-bottom"><div class="card-price">${money(p.price)}<span class="card-weight">${p.weight}</span></div><button class="add-button" data-product="${p.id}" aria-label="Добавить ${p.name}">+</button></div></div></article>`).join('');
}
function renderCategories(){const cats=['Всё меню',...new Set(MENU.map(p=>p.category))];$('#categories').innerHTML=cats.map((c,i)=>`<button class="category ${i===0?'active':''}" data-category="${c}" aria-pressed="${i===0}">${c}<span>${i===0?MENU.length:MENU.filter(p=>p.category===c).length}</span></button>`).join('');}
function openProduct(id){selected=MENU[id];if(!selected)return;quantity=1;const p=selected;$('#product-content').innerHTML=`<div class="product-layout"><div class="product-image">${food(p)}</div><div class="product-details"><div class="eyebrow">${p.category} · ${p.weight}</div><h2>${p.name}</h2><p class="product-description">${p.description}</p>${removals(p).length?`<div class="option-heading">Убрать из состава</div><div class="options">${removals(p).map(r=>`<label class="option"><input type="checkbox" name="remove" value="${r}">${r}</label>`).join('')}</div>`:''}${customizable(p)?`<div class="option-heading">Добавить вкус</div><div class="options">${EXTRAS.map(e=>`<label class="option"><input type="checkbox" name="extra" value="${e.id}">${e.name} +${e.price} ₸</label>`).join('')}</div>`:''}<div class="product-actions"><div class="stepper"><button type="button" id="product-minus" aria-label="Уменьшить количество">−</button><span id="product-qty">1</span><button type="button" id="product-plus" aria-label="Увеличить количество">+</button></div><button class="primary" id="product-add">В корзину <b id="product-price">${money(p.price)}</b></button></div></div></div>`;showDialog($('#product-dialog'));updateProductPrice();}
function currentItem(){return {id:selected.id,qty:quantity,extras:[...document.querySelectorAll('[name="extra"]:checked')].map(x=>x.value),removed:[...document.querySelectorAll('[name="remove"]:checked')].map(x=>x.value)};}
function updateProductPrice(){if(!selected)return;$('#product-qty').textContent=quantity;$('#product-price').textContent=money(itemPrice(currentItem())*quantity);$('#product-minus').disabled=quantity===1;$('#product-plus').disabled=quantity===99;}
function renderCart(){const count=cart.reduce((s,i)=>s+i.qty,0);$('#cart-count').textContent=count;$('#drawer-count').textContent=count?`(${count})`:'';$('#mobile-total').textContent=money(total());$('#mobile-cart').classList.toggle('visible',count>0);$('#checkout-area').hidden=!count;$('#cart-total').textContent=money(total());$('#cart-items').innerHTML=count?cart.map((i,index)=>{const p=MENU[i.id];const details=[...i.removed,...i.extras.map(id=>'+ '+EXTRAS.find(e=>e.id===id).name)].join(' · ');return `<div class="cart-item">${food(p)}<div><h3>${p.name}</h3><p>${details||'Стандартный состав'}</p><div class="cart-item-bottom"><div class="stepper"><button data-cart-action="minus" data-index="${index}" aria-label="Уменьшить количество ${p.name}">−</button><span>${i.qty}</span><button data-cart-action="plus" data-index="${index}" aria-label="Увеличить количество ${p.name}" ${i.qty>=99?'disabled':''}>+</button></div><b>${money(itemPrice(i)*i.qty)}</b></div><button class="remove-item" data-cart-action="remove" data-index="${index}">Удалить</button></div></div>`;}).join(''):`<div class="empty-cart"><div class="empty-symbol">✳</div><h3>Здесь будет вкусно.</h3><p>Выбери что-нибудь из меню.<br>Начнём с сочного бургера?</p><button class="primary" data-close>К меню ↗</button></div>`;}
function buildOrder(data){let lines=['Здравствуйте, хочу заказать —',''];cart.forEach((i,n)=>{lines.push(`${n+1}. ${MENU[i.id].name} × ${i.qty} — ${money(itemPrice(i)*i.qty)}`);if(i.removed.length)lines.push('   '+i.removed.join(', '));if(i.extras.length)lines.push('   Добавить: '+i.extras.map(id=>EXTRAS.find(e=>e.id===id).name).join(', '));});lines.push('',`Итого за блюда: ${money(total())}`,`Получение: ${data.get('fulfillment')}`);if(data.get('customer').trim())lines.push(`Имя: ${data.get('customer').trim()}`);if(data.get('fulfillment')==='Доставка')lines.push(`Адрес: ${data.get('address').trim()}`);if(data.get('comment').trim())lines.push(`Комментарий: ${data.get('comment').trim()}`);lines.push('','Подскажите, пожалуйста, время готовности'+(data.get('fulfillment')==='Доставка'?' и стоимость доставки.':'.'));return lines.join('\n');}
function openCombo(){const groups=[['Основное',MENU.filter(customizable)],['Закуска',MENU.filter(p=>p.category==='Закуски')],['Напиток',MENU.filter(p=>p.category==='Напитки')]];$('#combo-selects').innerHTML=groups.map(([name,items],i)=>`<label class="field">${i+1}. ${name}<select name="combo-${i}">${items.map(p=>`<option value="${p.id}">${p.name} — ${money(p.price)}</option>`).join('')}</select></label>`).join('');updateCombo();showDialog($('#combo-dialog'));}
function comboItems(){return [...document.querySelectorAll('#combo-selects select')].map(el=>MENU[Number(el.value)]);}
function updateCombo(){const items=comboItems();$('#combo-total').textContent=money(items.reduce((s,p)=>s+p.price,0));$('#combo-preview').innerHTML=items.map(p=>food(p)).join('');}
document.addEventListener('click',event=>{const el=event.target.closest('button');if(!el)return;if(el.hasAttribute('data-product'))openProduct(Number(el.dataset.product));if(el.hasAttribute('data-close'))el.closest('dialog').close();if(el.dataset.category){document.querySelectorAll('.category').forEach(b=>{b.classList.toggle('active',b===el);b.setAttribute('aria-pressed',String(b===el));});renderMenu(el.dataset.category);}if(el.id==='product-minus'){quantity=Math.max(1,quantity-1);updateProductPrice();}if(el.id==='product-plus'){quantity=Math.min(99,quantity+1);updateProductPrice();}if(el.id==='product-add'){addItem(currentItem());$('#product-dialog').close();notify(`${selected.name} — в корзине`);}if(el.dataset.cartAction){const index=Number(el.dataset.index);if(!cart[index])return;if(el.dataset.cartAction==='plus')cart[index].qty=Math.min(99,cart[index].qty+1);else if(el.dataset.cartAction==='minus'&&cart[index].qty>1)cart[index].qty--;else cart.splice(index,1);saveCart();}});
$('#product-dialog').addEventListener('change',updateProductPrice);
$('#open-cart').onclick=$('#mobile-cart').onclick=()=>showDialog($('#cart-dialog'));
$('#combo-nav').onclick=$('#combo-banner-button').onclick=openCombo;
$('#combo-form').addEventListener('change',updateCombo);
$('#combo-form').addEventListener('submit',event=>{event.preventDefault();comboItems().forEach(p=>addItem({id:p.id,qty:1,extras:[],removed:[]}));$('#combo-dialog').close();notify('Твоё трио добавлено в корзину');});
$('#checkout-form').addEventListener('change',()=>{const delivery=$('[name="fulfillment"]:checked').value==='Доставка';$('#address-field').hidden=!delivery;$('[name="address"]').required=delivery;});
$('#checkout-form').addEventListener('submit',event=>{event.preventDefault();if(!cart.length)return;const data=new FormData(event.currentTarget);if(data.get('fulfillment')==='Доставка'&&!data.get('address').trim()){$('[name="address"]').setCustomValidity('Укажите адрес доставки');$('[name="address"]').reportValidity();return;}const url=`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(buildOrder(data))}`;window.open(url,'_blank','noopener,noreferrer');});
$('[name="address"]').addEventListener('input',event=>event.target.setCustomValidity(''));
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');});d.addEventListener('click',event=>{if(event.target===d){const r=d.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)d.close();}});});
renderCategories();renderMenu();renderCart();
