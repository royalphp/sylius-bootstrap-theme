import * as app from './index';

app.whenReady((): void => {
    app.initBootstrapPlugins();
    app.initSyliusExtensions();
    app.initCustomExtensions();
});
