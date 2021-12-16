// Intersection Observer polyfill
import 'intersection-observer';

import Vue from 'vue';
import App from './App.vue';

import VuePDFComponents from '../src';

Vue.component('PDFViewer', VuePDFComponents);

Vue.config.productionTip = false;

new Vue({
	render: (h) => h(App)
}).$mount('#app');
