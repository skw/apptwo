# apptwo

## Install & Running

```
$ git clone 
$ sudo npm install bower -g
$ sudo npm install grunt-cli
$ npm install
$ bower install
```

Styles can be build with grunt:

```
$ grunt
```

The node server can be started with npm:

```
$ npm start
```

## Functionality

- video lookups
- saved searches
- keyword search
- pagination
- deleting searches also removes related dom elements and views

## Considerations

- Started implementing some validation, but I didn't setup a database for syncs/saves
- didn't have time to write test cases
- lacks error handling
- some pagination bugs
- the automatic refresh flag is logged in the collection and would start the ticker, which would refresh the views
- switched to cdns during development, but the bower components can easily be concatenated and minified