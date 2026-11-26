import {test} from 'node:test';
import assert from 'node:assert/strict';
import {refeicaoDoHorario, refeicoesOrdenadas} from '../alimentacao.mjs';

const menus = [{t:'20:30',nome:'Noite'},{t:'8:00',nome:'Manhã'},{t:'08:05',nome:'Segunda opção'},{t:'25:90',nome:'Inválido'}];
const meals = refeicoesOrdenadas(menus);
const clock = (hour,minute) => new Date(2030,6,15,hour,minute);
test('Os planos seguem os horários válidos em ordem, sem modificar as notas',()=>{
  assert.deepEqual(meals.map(m=>m.nome),['Manhã','Segunda opção','Noite']);
  assert.equal(menus[0].nome,'Noite');
  assert.equal(refeicaoDoHorario([],clock(9,0)),null);
});
test('Um horário exato e dois horários próximos selecionam a refeição correta',()=>{
  assert.equal(refeicaoDoHorario(meals,clock(8,0)).meal.nome,'Manhã');
  assert.deepEqual(refeicaoDoHorario(meals,clock(8,5)),{index:1,meal:meals[1],amanha:false,mins:0});
  assert.equal(refeicaoDoHorario(meals,clock(8,15)).mins,-10);
  assert.equal(refeicaoDoHorario(meals,clock(8,16)).meal.nome,'Noite');
});
test('A próxima refeição depois da última da noite pertence ao próximo dia',()=>{
  assert.deepEqual(refeicaoDoHorario(meals,clock(23,59)),{index:0,meal:meals[0],amanha:true,mins:481});
  assert.equal(refeicaoDoHorario(meals,clock(0,0)).amanha,false);
});

import {lerTrocas, gravarTroca, aplicarTroca, chaveTroca} from '../alimentacao.mjs';
test('Troca fixa: grava, lê de volta, substitui a anterior do mesmo item e desfaz',()=>{
  const tr = {quem:'diovane',t:'08:10',refeicao:'Café da manhã',orig:'Pão francês',n:'Tapioca',q:'45 g'};
  let txt = gravarTroca(null,tr,'2026-11-26');
  assert.match(txt,/^- Diovane · 08:10 Café da manhã · Pão francês → Tapioca · 45 g · desde 2026-11-26$/m);
  let m = lerTrocas(txt);
  assert.equal(m.size,1);
  assert.deepEqual(m.get(chaveTroca('diovane','08:10','Pao frances')),{quem:'diovane',t:'08:10',refeicao:'Café da manhã',orig:'Pão francês',n:'Tapioca',q:'45 g',desde:'2026-11-26'});
  txt = gravarTroca(txt,{...tr,n:'Pão de queijo',q:'5 pequenos (50 g)'},'2026-11-27');
  txt = gravarTroca(txt,{quem:'michele',t:'8:00',refeicao:'Café',orig:'Pão francês',n:'Cuscuz',q:''},'2026-11-27');
  m = lerTrocas(txt);
  assert.equal(m.size,2);
  assert.equal(m.get(chaveTroca('diovane','08:10','Pão francês')).n,'Pão de queijo');
  assert.equal(m.get(chaveTroca('michele','08:00','Pão francês')).q,'');
  const item = {n:'Pão francês',q:'1 unidade'};
  assert.equal(aplicarTroca(item,'diovane','08:10',m).troca.n,'Pão de queijo');
  assert.equal(aplicarTroca(item,'diovane','10:00',m),item);
  txt = gravarTroca(txt,{...tr,n:''},'2026-11-28');
  assert.equal(lerTrocas(txt).size,1);
  assert.match(txt,/^# Trocas em uso$/m);
});
