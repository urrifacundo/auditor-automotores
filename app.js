let sourceRows=[], audited=[];
const $=id=>document.getElementById(id);
const norm=s=>(s??"").toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/\s+/g," ").trim();
const get=(r,names)=>{for(const n of names){const k=Object.keys(r).find(k=>norm(k)===norm(n));if(k)return r[k]}return ""};

function classify(row){
 const relato=norm(get(row,["relato","descripcion","narrativa","hecho"]));
 const car=norm(get(row,["analisis_caratula","caratula"]));
 if(!relato) return null;

 // Exclusiones fuertes: piezas/pertenencias sin evidencia de sustracción del rodado completo.
 const partes=/\b(PATENTE|CHAPA PATENTE|RUEDA|CUBIERTA|AUXILIO|BATERIA|ESTEREO|AUTOPARTE|PERTENENCIAS)\b/;
 const vehiculo=/\b(AUTOMOVIL|AUTO|VEHICULO|RODADO|CAMIONETA|CAMION|UTILITARIO|FURGON|SEDAN)\b/;
 const moto=/\b(MOTO|MOTOCICLETA|MOTOVEHICULO|CICLOMOTOR)\b/;
 const sustr=/\b(SUSTRA(?:E|EN|JO|JERON|IDO|IDA)|ROBA(?:N|RON|DO|DA)?|APODERA(?:N|RON)?|SE LLEV(?:A|AN|ARON)|YA NO (?:SE )?ENCONTRABA|NO SE ENCONTRABA|FALTANTE DEL RODADO)\b/;
 const recupera=/\b(HALLA(?:DO|DA|RON|N)?|LOCALIZA(?:DO|DA|RON|N)?|RECUPERA(?:DO|DA|RON|N)?|ENCUENTRA(?:N|RON)?|DAN CON (?:EL|LA) (?:VEHICULO|RODADO|AUTO|CAMIONETA)|PEDIDO DE SECUESTRO|SECUESTRO ACTIVO)\b/;
 const hallazgoOrigen=/\b(HALLAZGO|VEHICULO ABANDONADO|RODADO ABANDONADO|PEDIDO DE SECUESTRO|SECUESTRO ACTIVO|PROCEDEN? AL SECUESTRO)\b/;

 const hasVehicle=vehiculo.test(relato)||/SUSTRA[C]?CION AUTOMOTOR/.test(car);
 const hasMoto=moto.test(relato)&&!vehiculo.test(relato);
 const hasSustr=sustr.test(relato);
 const hasRec=recupera.test(relato);
 if(hasMoto && !hasVehicle) return null;

 // Hallazgo independiente: recuperación/pedido activo sin narración de sustracción actual.
 if(hasRec && !hasSustr && (hallazgoOrigen.test(relato)||/HALLAZGO AUTOMOTOR/.test(car)))
   return {cond:"HALLAZGO",why:"Relato de hallazgo/recuperación sin sustracción actual narrada."};

 // Inmediato exige los dos eventos en el mismo relato.
 if(hasVehicle && hasSustr && hasRec)
   return {cond:"INMEDIATO",why:"El relato contiene sustracción del automotor y posterior recuperación/localización."};

 if(hasVehicle && hasSustr){
   // Si el texto sólo habla claramente de una pieza, no aceptar por ahora.
   if(partes.test(relato) && !/\b(RODADO|VEHICULO|AUTOMOVIL|AUTO|CAMIONETA)\b.{0,80}\b(SUSTRA|ROBA|APODERA|LLEV)/.test(relato)
      && !/\b(SUSTRA|ROBA|APODERA|LLEV).{0,80}\b(RODADO|VEHICULO|AUTOMOVIL|AUTO|CAMIONETA)\b/.test(relato)) return null;
   return {cond:"SUSTRAIDO",why:"Evidencia narrativa de apoderamiento del automotor completo sin recuperación posterior."};
 }
 return null;
}

$("file").addEventListener("change",async e=>{
 const f=e.target.files[0]; if(!f)return;
 const data=await f.arrayBuffer(), wb=XLSX.read(data), ws=wb.Sheets[wb.SheetNames[0]];
 sourceRows=XLSX.utils.sheet_to_json(ws,{defval:""});
 $("audit").disabled=false;$("status").textContent=`${sourceRows.length.toLocaleString("es-AR")} filas cargadas. Listo para auditar.`;
});

$("audit").addEventListener("click",()=>{
 audited=[];
 for(const row of sourceRows){const c=classify(row);if(c)audited.push({...row,CONDICION_AUDITOR:c.cond,MOTIVO_AUDITOR:c.why});}
 render(); $("download").disabled=!audited.length;
});

function render(){
 const counts={SUSTRAIDO:0,INMEDIATO:0,HALLAZGO:0};audited.forEach(r=>counts[r.CONDICION_AUDITOR]++);
 $("summary").innerHTML=Object.entries(counts).map(([k,v])=>`<div class="pill">${k}: ${v}</div>`).join("");
 $("status").textContent=`Auditoría terminada: ${audited.length} candidatos. Revisá los resultados antes de tomarlos como definitivos.`;
 $("rows").innerHTML=audited.slice(0,1000).map(r=>`<tr><td class="${r.CONDICION_AUDITOR}">${r.CONDICION_AUDITOR}</td><td>${esc(get(r,["numero_interno","nro_interno","numero interno"]))}</td><td>${esc(get(r,["analisis_caratula","caratula"]))}</td><td>${esc(r.MOTIVO_AUDITOR)}</td><td class="relato">${esc(get(r,["relato","descripcion","narrativa","hecho"]))}</td></tr>`).join("");
}
function esc(v){return (v??"").toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
$("download").addEventListener("click",()=>{
 const ws=XLSX.utils.json_to_sheet(audited),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"AUDITORIA");
 XLSX.writeFile(wb,"AUDITORIA_AUTOMOTORES.xlsx");
});