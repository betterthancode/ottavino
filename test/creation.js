describe('Creation of components', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  describe('Should define a custom element', () => {
    it('with shadow DOM', () => {
      ottavino.component({
        tag: 'hello-world-with-shadow',
        template: '<h1>With Shadow</h1>',
        shadow: true
      });
      document.body.appendChild(
        document.createElement('hello-world-with-shadow')
      );
      const el = document.querySelector('hello-world-with-shadow');
      const shadow = el.shadowRoot;
      const inner = shadow.querySelector('h1');
      assert(el instanceof HTMLElement);
      assert(!(el instanceof HTMLUnknownElement));
      assert.equal('With Shadow', inner.innerText);
    });

    it('without shadow DOM', done => {
      ottavino.component({
        tag: 'hello-world-no-shadow',
        template: '<h1>No Shadow</h1>',
        shadow: false
      });
      document.body.appendChild(
        document.createElement('hello-world-no-shadow')
      );
      setTimeout(() => {
        // using timeout to push beyond the no-shadow render microtask
        const el = document.querySelector('hello-world-no-shadow');
        const shadow = el.shadowRoot;
        const inner = el.querySelector('h1');
        assert(el instanceof HTMLElement);
        assert(!(el instanceof HTMLUnknownElement));
        assert.notExists(shadow);
        assert.equal('No Shadow', inner.innerText);
        done();
      }, 20);
    });
  });

  describe('Should upgrade a legacy element', () => {
    it('with shadow DOM', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);
      ottavino.component({
        mount: div,
        template: '<h1>With Shadow</h1>',
        shadow: true
      });
      const el = document.querySelector('div');
      const shadow = el.shadowRoot;
      const inner = shadow.querySelector('h1');
      assert(el instanceof HTMLElement);
      assert(!(el instanceof HTMLUnknownElement));
      assert.equal('With Shadow', inner.innerText);
    });

    it('without shadow DOM', done => {
      const div = document.createElement('div');
      document.body.appendChild(div);
      ottavino.component({
        mount: div,
        template: '<h1>No Shadow</h1>'
      });
      setTimeout(() => {
        // using timeout to push beyond the no-shadow render microtask
        const el = document.querySelector('div');
        const shadow = el.shadowRoot;
        const inner = el.querySelector('h1');
        assert(el instanceof HTMLElement);
        assert(!(el instanceof HTMLUnknownElement));
        assert.notExists(shadow);
        assert.equal('No Shadow', inner.innerText);
        done();
      }, 20);
    });
  });
});
