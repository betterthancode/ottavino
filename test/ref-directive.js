ottavinoDirectives.ref.registerAsGlobal();

describe('#ref Directive', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('Should inject reference', done => {
    ottavino.component({
      tag: 'ref-injector-1',
      shadow: true,
      template: /*html*/ `
        <div id="target-ref" #ref="myDiv">{{this.test}}</div>
      `,
      properties: {
        test: 'passed'
      }
    });
    const el = document.createElement('ref-injector-1');
    document.body.appendChild(el);
    const div = el.shadowRoot.querySelector('#target-ref');
    assert.strictEqual(div, el.ref.myDiv);
    assert.strictEqual(div, el.proxy.$.myDiv);
    done();
  });
});
