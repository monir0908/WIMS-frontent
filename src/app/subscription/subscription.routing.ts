import { Routes } from '@angular/router';

import { SubscriptionComponent } from './subscription.component';

export const SubscriptionRoutes: Routes = [{
  path: '',
  component: SubscriptionComponent,
  data: {
    breadcrumb: 'Actions',
    icon: 'icofont-home bg-c-blue',
    status: false
  }
}];
