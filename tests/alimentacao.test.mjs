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
