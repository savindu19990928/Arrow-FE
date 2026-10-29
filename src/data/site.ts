export const LOGO_URL = "/Arrow_Ventures_Logo.png";
export const HERO_IMAGE = "/80d80c2a-c5e5-4ca1-b8db-7021234b19c3.jpg";
export const WORKSHOP_IMAGE = "/874fb4c6-a484-45f5-900c-0bbee3806c43.jpg";

export const contact = {
  phone: '+94 77 123 4567',
  phoneHref: 'tel:+94771234567',
  email: 'service@arrowventures.com',
  hours: 'Monday – Friday, 9AM – 6PM'
};

export const mainNav = [
{ to: '/catalog', label: 'Catalog' },
{ to: '/maintenance', label: 'Maintenance' },
{ to: '/track-order', label: 'Track order' }];


export const footerGroups = [
{
  title: 'Shop',
  links: [
  { to: '/catalog', label: 'All products' },
  { to: '/catalog?featured=true', label: 'Featured' },
  { to: '/catalog?has_3d=true', label: 'View in 3D' },
  { to: '/cart', label: 'Cart' }]

},
{
  title: 'Support',
  links: [
  { to: '/maintenance', label: 'Maintenance & warranty' },
  { to: '/track-order', label: 'Track an order' },
  { to: '/account', label: 'My account' }]

},
{
  title: 'Policies',
  links: [
  { to: '/policies/refund', label: 'Refund policy' },
  { to: '/policies/privacy', label: 'Privacy policy' },
  { to: '/policies/terms', label: 'Terms & conditions' }]

}];


export const sortOptions = [
{ value: '-created_at', label: 'Newest' },
{ value: 'price', label: 'Price: low to high' },
{ value: '-price', label: 'Price: high to low' },
{ value: '-average_rating', label: 'Top rated' }];


export const orderSteps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];