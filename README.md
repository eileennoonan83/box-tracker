Hello! I built this application for a local moving company to help them run their free box program. The app is intended to be used by workers in a warehouse while interfacing directly with customers. 

Customers come in and pick up boxes, and return them later for a refund. They can also purchase non-refundable supplies like packing tape. The application manages pickups and returns, as well as credit card charges, refunds, and pre-authorizations. 

The UI is optimized for speed and ease of use for workers over the long term, not for beauty. It would benefit from design intervention. But cost is always a factor and this client highly prioritizes function over form.

Included here is the mobile frontend, written with NativeScript+Angular+TypeScript, and the API backend, which uses Laravel. The app is in Laravel 5 currently, but it was initiated in Laravel 4, so you may notice some outdated conventions.

The the App_Resources folder is omitted from the frontend because it contains client-specific images.

The backend is really just a sliver of the entire application, which is used by this company to manage customers, create work estimates, schedule jobs and many other functions. Their sales teams use the application all day, every day. I only want to include the part that is relevant to the box tracker app because that will cut down on clutter and and is most representative of my current skill set.