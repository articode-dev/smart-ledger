// Smart Ledger — View Router
const Router = (() => {
  const views = {};
  let currentView = null;
  let history = [];

  const register = (name, viewFn) => {
    views[name] = viewFn;
  };

  const navigate = (name, params = {}, replace = false) => {
    if (!views[name]) { console.error('Unknown view:', name); return; }
    if (!replace) history.push({ name: currentView, params: {} });
    currentView = name;
    const container = document.getElementById('app');
    container.classList.add('view-exit');
    setTimeout(() => {
      container.innerHTML = '';
      container.classList.remove('view-exit');
      container.classList.add('view-enter');
      views[name](container, params);
      setTimeout(() => container.classList.remove('view-enter'), 300);
    }, 150);
  };

  const back = () => {
    const prev = history.pop();
    if (prev?.name) navigate(prev.name, prev.params || {}, true);
    else navigate('dashboard', {}, true);
  };

  const canGoBack = () => history.length > 0;

  return { register, navigate, back, canGoBack };
})();
