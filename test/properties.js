describe('Custom Element Properties propogation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  it('Should propagate property and update template', () => {
    ottavino.component({
      tag: 'prop-test-1',
      template: /*html*/ `
        <div id="prop-test-1-div">Value is {{this.magicNumber}}</div>
        <div id="nested">Value is {{this.nested.name}}</div>
        <button onclick="{{this.magicNumber = 10}}">Set Value to 10</button>
      `,
      properties: {
        magicNumber: 0,
        nested: {
          name: 'ottavino'
        }
      },
      shadow: true
    });
    document.body.appendChild(document.createElement('prop-test-1'));
    const el = document.querySelector('prop-test-1');
    const div = el.shadowRoot.querySelector('#prop-test-1-div');
    const nestedEl = el.shadowRoot.querySelector('#nested');
    const btn = el.shadowRoot.querySelector('button');
    assert.equal('Value is 0', div.innerText);
    el.magicNumber = 42;
    assert.equal('Value is 42', div.innerText);
    btn.click();
    assert.equal('Value is 10', div.innerText);
    el.nested = {
      name: 'Test Passed'
    };
    assert.equal('Value is Test Passed', nestedEl.innerText);
  });
});
