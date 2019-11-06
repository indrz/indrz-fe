export default function ({ route, store, redirect }) {
  const publicPages = ['/', '', 'de', 'en', '/admin/login'];
  const isAdminRoute = route.path.includes('admin');
  const routePath = route.path && route.path.length > 1 ? route.path.split('/')[1] : '';

  if (isAdminRoute && publicPages.includes(route.path)) {
    return;
  }

  if (!store.state.user.user && !publicPages.includes(routePath)) {
    if (route.path && route.path.length && route.path !== '/admin/login') {
      return redirect('/admin/login?redirect=' + route.path);
    }
    return redirect('/');
  }
};
