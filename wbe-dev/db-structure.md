# Wyrld Byldr Engyne Database Structure

*** THESE ARE EARLY DRAFT NOTES AND ARE PLANNED TO CHANGE SOON *** A model database is being constructed that will improve clarity ***

- Each heading designates a branch in the structure tree. After each heading will be a note giving the qualifications for an asset to be categorized under that heading
- Primal Structures are marked in the Database Structure with an asterisk
- Each Asset will have a pointer to its parent Asset (top-level assets will point to a Primal Structure)
- Each Asset underneath a Primal Structure category will not be strictly necessary to create a Project

## Project Assets

- Has a Project ID
- Has a designator set to either Formal or Local

### Spacial Structures*

- Is a designation of space

#### Spaces

- Exists in space but not necessarily time

### Timeframes*

- Is a designation of time

#### Time Periods

- Exists in time but not necessarily space

### Objects*

- Interacts with or is interacted with by things that exist in space and time

#### Physical Objects

- Exists in space and time
- Has a physical form

##### Characters

- Has a will they can manifest

##### Items

- Can be used by a Character

### Data

- Exists outside of space and time and does not on their own interact with things that exist in space and time

#### Properties*

- Has a direct effect when applied to an object

##### Character Stats

- Is applied to a Character

##### Item Stats

- Is applied to an Item

#### Information*

- Does not have a direct effect when applied to an object

##### Lore*

- Can theoretically be represented by a string of text (perhaps of infinite length)

##### Sounds*

- Can theoretically be represented by an audio file (perhaps of infinite length)

##### Images*

- Can theoretically be represented by an image file (perhaps of infinite dimensions)

## User Assets

- Has a Version ID

### Users

- Has a User ID

### Information

- Has an Info ID

#### Permissions

- Designates what a User can Create, Read, Update, and Delete

#### Permission Levels

- Grouping of Permissions in a way that is assignable to a User

##### Project Permission Levels

- Designates what a User can CRUD within a specific project

##### Subscription Permission Levels

- Designates what a User can do application wide (e.g. there may be limitations on how many Projects a user can create while using a Free subscription, while there may be an Unlimited subscription that a User can pay for to make as many projects as they want)
