export default function ({ route, store, redirect }) {
  const publicPages = ['pinpo', 'pinpo-date', 'login', 'signup'];
  const isPinpoRoute = route.path.includes('pinpo');
  const routePath = route.path && route.path.length > 1 ? route.path.split('/')[1] : '';

  if (isPinpoRoute) {
    publicPages.push()
  }

  if (!store.state.user.user && !publicPages.includes(routePath)) {
    if (route.path && route.path.length && route.path !== '/login') {
      return redirect('/login?redirect=' + route.path);
    }
    return redirect('/login');
  }
};
