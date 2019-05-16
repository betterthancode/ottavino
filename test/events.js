describe('Event Handling', () => {
  let wasClicked = 0;
  before(() => {
    ottavino.component({
      tag: 'test-click-event',
      shadow: true,
      template: /*html*/`
      <h1>CLICK THE TEXT</h1>
      <p onclick={{this.captureClick()}}>This is the paragraph</p>
      `,
      this: {
        captureClick: function () {
          wasClicked++;
        }
      }
    });
  });
  beforeEach(() => document.body.innerHTML = '');
  it('Should capture clicks', done => {
    const el = document.createElement('test-click-event');
    document.body.appendChild(el);
    el.shadowRoot.querySelector('p').click();
    assert.equal(1, wasClicked);
    el.shadowRoot.querySelector('p').click();
    assert.equal(2, wasClicked);
    done();
  });
});