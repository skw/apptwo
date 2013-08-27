(function () {
  $('#t_nav a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
  })
  
  // Models
  
  var Search = Backbone.Model.extend({
    
    initialize: function(){
      console.log('search model has been initialized')
    },
    
    validate: function(attrs, options) {
      if (!attrs.title.length) {
        return "Title required.";
      }
      if (!attrs.keywords.length) {
        return "Keywords required.";
      }      
    }

  });
  
  var Result = Backbone.Model.extend({
    
    initialize: function(){
      console.log('result model has been initialized')
    }
  })
  
  // Collections
  
  var History = Backbone.Collection.extend({
    
    initialize: function(){
      console.log('search history collection has been initialized');
    },
    model: Search
  });
  
  var Results = Backbone.Collection.extend({
    
    initialize: function(){
      console.log('results collection has been initialized');
    },
    model: Result
  });
  
  // Views
  
  var HistoryView = Backbone.View.extend({
    el: '#home',
    
    events: {
      "click #search": "search",
      "click .delete": "delete" 
    },
    
    initialize: function() {
      console.log('history view has been initialized');
      _.bindAll(this);
      this.col = new History;
      this.results = [];
      this.listenTo(this.col, "add", this.render);
      this.listenTo(this.col, "remove", this.remove);
    },
    
    search: function() {
      var data = {};
      data.title = $( this.el ).find( '#inputTitle' ).val();
      data.keywords = $( this.el ).find( '#inputKeywords' ).val();
      data.refresh = $( this.el ).find( '#refresh' ).is(':checked');
      if( data.refresh ) {
        console.log('turn ticker on');
      }
      this.col.add( data );
    },

    delete: function( e ) {
      console.log( 'ding' );
      var cid = $( e.currentTarget ).closest( 'tr' ).data( 'cid' );
      var model = this.col.get( cid );
      this.col.remove( model );
    },
    
    remove: function( model ) {
      console.log('remove');
      $( '#' + model.cid ).remove();
      this.results[model.cid].remove();
    },
    
    render: function( model ) {
      console.log('rendering search history');
      
      //validation
      model.on("invalid", function(model, error) {
        console.log(error);
      });
            
      // render search history
      var template = "<tr id=\"{{cid}}\" data-cid=\"{{cid}}\"><td>{{title}}</td><td>{{keywords}}</td><td><input class=\"btn btn-default delete\" type=\"button\" value=\"Delete\"></td></tr>";
      var template = Hogan.compile(template);
      model.attributes.cid = model.cid;
      $( ".saved tbody" ).append( template.render(model.attributes) );
      
      // format keywords
      var keystring = (model.attributes.keywords)
        .trim()
        .replace(/\s{1,}/g, '+');
      
      var url = 'https://gdata.youtube.com/feeds/api/videos?alt=json&max-results=20&q=' + keystring;
      
      // create a new results view and pass the query keyword string
      this.results[model.cid] = new ResultsView({
        url: url,
        search: model.attributes,
        cid: model.cid
        //el: 't_' + model.cid
      });
      
    }
    
  });
  
  var ResultsView = Backbone.View.extend({
    el: 'body',
    
    events: {
      "click a.page": "refresh",
      "click #t_nav": "refresh"       
    },
    
    initialize: function( options ) {
      console.log('history view has been initialized');
      _.bindAll(this);
      this.col = new Results;
      this.url = options.url;
      this.request( this.url );
      
      //generate tab
      this.t_info = {
        title: options.search.keywords,
        cid: options.cid
      };
      var nav_template = Hogan.compile("<li id=\"t_nav_{{cid}}\"><a href=\"#t_{{cid}}\" data-toggle=\"tab\">q &lsquo;{{title}}&lsquo;</a></li>");
      var tab_template = Hogan.compile("<div class=\"tab-pane active results\" id=\"t_{{cid}}\"></div>");
      $("#t_nav").append( nav_template.render( this.t_info ) );
      $("#t_content").append( tab_template.render( this.t_info ) );
      
      //activate tab
      $('#t_nav a:last').tab('show');
      
      this.el = '#t_' + this.t_info.cid;
    },

    request: function( url, page ) {
      this.stats = {}
      var that = this;
      var render = this.render; // to call this in $.get
      var col = this.col;

      // request json from url
      $.get( url, function( data ) {
        var entries = data.feed.entry;
        console.log(data);
        that.stats = {
          itemsPerPage: data.feed.openSearch$itemsPerPage.$t,
          startIndex: data.feed.openSearch$startIndex.$t,
          totalResults: data.feed.openSearch$totalResults.$t
        };
        _.each( entries, function( entry ) {
          var result = {};
          result.img = entry.media$group.media$thumbnail[0].url;
          result.title = entry.title.$t;
          result.desc = entry.content.$t;
          result.url = entry.link[0].href;
          col.add( result );
        });
        render( page );
      }).fail( function(){
        console.log( 'Failed to retrieve youtube data.')
      });
    },

    remove: function( ) {
      $( this.el ).remove(); 
      $("#t_nav_" + this.t_info.cid ).remove();
      var model;
      
      while (model = this.col.first()) {
        model.destroy();
      }
    },
    
    refresh: function( e ) {
      //e.preventDefault();
      console.log(this.url);
      var page = $( e.currentTarget ).data('id');
      if(typeof page === 'undefined'){
        page = 1;
      };
      console.log(page);
      var url = this.url + '&start-index=' + ((page * 20) - 19);
      console.log(url);
      this.request( url, page );
    },
    
    render: function( page ) {
      console.log( 'rendering results')
      if(typeof page === 'undefined'){
        page = 1;
      };
      var p_info = {
        first: true,
        last: false
      };
      var p_template = Hogan.compile(
        '<ul class="pagination">' +
          '<li{{#first}} class="disabled"{{/first}}><a href="#">&laquo;</a></li>' +
          '{{#pages}}<li{{#active}} class="active"{{/active}}><a href="#" data-id="{{page}}" class="page">{{page}}</a></li>{{/pages}}' +
          '<li{{#last}} class="disabled"{{/last}}><a href="#">&raquo;</a></li>' +
        '</ul>'
      );
      var r_template = Hogan.compile(
        '<div class="col-sm-6 col-md-3">' +
          '<div class="thumbnail">' +
            '<img src="{{img}}" alt="{{title}}">' +
            '<div class="caption">' +
              '<h3>{{title}}</h3>' +
              '<p>{{desc}}</p>' +
              '<p><a href="{{url}}" target="_blank" class="btn btn-primary">Watch on Youtube</a>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
      
      var start = ((page * 20) - 19);
      var end = (page * 20);
      var i =page;
      var page_count = Math.ceil( this.stats.totalResults / 20 );
      var pages = []
      for ( var j = page; j <= page_count; j++ ) { 
        var paged = {
          page: j
        }
        if( i == j ){
          paged.active = true;
        }
        pages.push( paged );
        if ( i == page_count ){
          p_info.last = true;
        }
        if ( j >= ( page + 4 ) ){
          break;       
        }
      };
      
      console.log(page);

      
      var el = this.el;
      
      $( el ).empty();
      
      $( el ).append( p_template.render( {
        first: p_info.first,
        pages: pages,
        last: p_info.last
      }));
      
      $( el ).append( Hogan.compile( '<h1>{{start}}-{{end}} of {{total}} Result(s) for &lsquo;{{keywords}}&lsquo;</h1>' ).render( {
        end: end,
        total: this.stats.totalResults,
        start:  start,
        keywords: this.t_info.title
      } ) );
      i = 1;
      _.each( this.col.slice(start, end), function(model) {
        if( (i % 3) == 1) {
          $( el ).append( '<div class="row">' );
        }
        $( el ).append( r_template.render( model.attributes ) );
        if( (i % 3) == 0) {
          $( el ).append( '</div>' );
        }
        i++;
      });
    }
    
  });
  
  // ticker
  
  ticker = {
    max: 60000,
    tick: 10000,
    current: 0
  };
  
  setInterval(function() {
  
    if (ticker.current < ticker.max) {
      ticker.current += ticker.tick;
      return console.log(ticker.current + ' / ' + ticker.max);
    } else {
      console.clear();
      console.log('refresh...');
      ticker.current = 0;
    }
  }, ticker.tick);
  
  // Router
  
  var Router = Backbone.Router.extend({
    
    routes: {
      "*actions": "index"
    },
    
    initialize: function(){
      _.bindAll(this);
      this.historyView = new HistoryView({
      });
    },
    
    index: function(){
      return console.log('-> index');
    }

  });

  window.appRouter = new Router();
  
  Backbone.history.start();

}).call(this);