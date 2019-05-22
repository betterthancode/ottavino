ottavinoDirectives.propertyInjector(ottavino.registerDirective);

describe('Property Injector Directive', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('Should inject properties', (done) => {
    ottavino.component({
      tag: 'prop-injector-1',
      shadow: true,
      template: /*html*/`
        <div id="pass-prop" [test]="{{this.test}}">{{this.test}}</div>
      `,
      properties: {
        test: 'passed'
      },
    });
    const el = document.createElement('prop-injector-1');
    document.body.appendChild(el);
    const div = el.shadowRoot.querySelector('#pass-prop');
    assert.equal('passed', div.test);
    el.proxy.test = 'passed again';
    assert.equal('passed again', div.test);
    done();
  });
});