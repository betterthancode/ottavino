import { component } from '../../dist/index.js';

component({
  tag: 'parent-component',
  shadow: true,
  directives: [],
  template: /*html*/ `
  <h1>This is the number: {{this.myNumber}} {{this.myName}}</h1>
  <input value="{{this.myNumber}}" type="number" onchange="{{this.myNumber = event.target.value}}">
  <input value="{{this.myName}}" type="text" oninput="{{this.myName = event.target.value}}">
  <button onclick="{{this.myNumber++}}">Increment</button>
  <child-component [othernumber]="{{this.myNumber}}" pass="{{(this.myNumber+1) * 2}}"></child-component>
  `,
  init: function() {
  },
  properties: {
    myNumber: 0,
    myName: 'ottavino'
  }
});

component({
  tag: 'child-component',
  template: /*html*/`
    <h2>This is the [othernumber] {{this.othernumber}}</h2>
  `,
  properties: {
    othernumber: 0
  },
  attributes: {
    pass: function (value, oldValue) {
      console.log(value, oldValue);
    }
  }
})
