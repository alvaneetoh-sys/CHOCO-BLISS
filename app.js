const PRODUCTS=[
 {sku:"CHO-001",name:"Milk Chocolate",thai:"มิลค์ช็อกโกแลต",desc:"ช็อกโกแลตนมเนื้อนุ่ม หอมละมุน",price:89,theme:"milk",label:"MILK\nCHOCOLATE"},
 {sku:"CHO-002",name:"Dark Chocolate 70%",thai:"ดาร์กช็อกโกแลต 70%",desc:"โกโก้เข้มข้น รสสัมผัสลุ่มลึก",price:109,theme:"dark",label:"DARK\n70%"}
];
let cart={};
const $=id=>document.getElementById(id), money=n=>"฿"+Number(n).toLocaleString("th-TH");
function renderProducts(){$("productGrid").innerHTML=PRODUCTS.map(p=>`<article class="product-card"><div class="product-art ${p.theme}"><div class="wrapper">${p.label.replace("\n","<br>")}<br><small style="font-size:8px;letter-spacing:1px">CHOCO BLISS</small></div></div><div class="product-info"><div><h3>${p.thai}</h3><p>${p.desc}</p><p style="margin-top:7px;font-size:10px">SKU: ${p.sku}</p></div><span class="price">${money(p.price)}</span></div><button class="add-button" onclick="addToCart('${p.sku}')">+ เพิ่มลงตะกร้า</button></article>`).join("");}
function addToCart(sku){cart[sku]=(cart[sku]||0)+1;renderCart();toast("เพิ่มสินค้าลงตะกร้าแล้ว");}
function changeQty(sku,d){cart[sku]=(cart[sku]||0)+d;if(cart[sku]<=0)delete cart[sku];renderCart();}
function cartLines(){return Object.entries(cart).map(([sku,qty])=>({product:PRODUCTS.find(p=>p.sku===sku),qty})).filter(x=>x.product)}
function total(){return cartLines().reduce((s,x)=>s+x.product.price*x.qty,0)}
function renderCart(){let lines=cartLines();$("cartCount").textContent=lines.reduce((s,x)=>s+x.qty,0);$("cartItems").innerHTML=lines.length?lines.map(x=>`<div class="cart-row"><div><b>${x.product.thai}</b><div style="color:#86766b;margin-top:4px">${money(x.product.price)} × ${x.qty}</div></div><div class="qty"><button onclick="changeQty('${x.product.sku}',-1)">−</button>${x.qty}<button onclick="changeQty('${x.product.sku}',1)">+</button></div></div>`).join(""):'<p style="color:#86766b;text-align:center;padding:40px 0">ยังไม่มีสินค้าในตะกร้า</p>';$("cartTotal").textContent=money(total());$("checkoutTotal").textContent=money(total());}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2600)}
$("openCart").onclick=()=>$("cartOverlay").classList.add("show");$("closeCart").onclick=()=>$("cartOverlay").classList.remove("show");
$("checkoutBtn").onclick=()=>{if(!total())return toast("กรุณาเลือกสินค้าก่อน");$("cartOverlay").classList.remove("show");$("checkoutOverlay").classList.add("show")};
$("closeCheckout").onclick=()=>$("checkoutOverlay").classList.remove("show");
$("checkoutForm").addEventListener("submit",async e=>{e.preventDefault();const url=window.STORE_CONFIG?.SHEETS_WEB_APP_URL;if(!url||url.includes("PASTE_YOUR"))return toast("กรุณาตั้งค่า Google Apps Script URL ใน config.js ก่อน");
 const f=new FormData(e.target),order={customerName:f.get("customerName").trim(),phone:f.get("phone").trim(),address:f.get("address").trim(),postcode:f.get("postcode").trim(),note:f.get("note").trim(),items:cartLines().map(x=>({sku:x.product.sku,name:x.product.thai,qty:x.qty,unitPrice:x.product.price})),total:total(),createdAt:new Date().toISOString()};
 const btn=$("submitOrder");btn.disabled=true;btn.textContent="กำลังบันทึก...";
 try{await fetch(url,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(order)});cart={};renderCart();e.target.reset();$("checkoutOverlay").classList.remove("show");toast("ส่งคำสั่งซื้อแล้ว ขอบคุณที่อุดหนุน Choco Bliss");}
 catch(err){toast("ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่");console.error(err)}
 finally{btn.disabled=false;btn.textContent="ยืนยันคำสั่งซื้อ";}
});
renderProducts();renderCart();