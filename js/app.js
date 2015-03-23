$(function () {

	//
	// Model and Collection
	// -----------------------

	var Item = Backbone.Model.extend({
		defaults: function () {
			return {
				name: "Site name",
				url: "about:blank",
				image: "",
				order: Items.nextOrder()
			};
		}
	});

	var ItemList = Backbone.Collection.extend({
		model: Item,
		localStorage: new Backbone.LocalStorage("starttab-links"),

		// order of items
		nextOrder: function () {
			if (!this.length) return 1;
			return this.last().get('order') + 1;
		},

		comparator: 'order'
	});

	var Items = new ItemList;

	//
	// View
	// -----------------------

	var ItemView = Backbone.View.extend({

		tagName: "li",
		template: _.template($('#item-template').html()),

		events: {
			"dblclick .item": "edit",
			"click .remove": "removeItem",
			"click .done": "saveChanges",
			"keypress .name, .url": "updateOnEnter"
		},

		initialize: function () {
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
		},

		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		edit: function () {
			$(".editing").removeClass("editing");
			this.$el.addClass("editing");
		},

		saveChanges: function () {
			var name = this.$el.find(".name").val(),
				url = this.$el.find(".url").val();

			if (!name || !url) {
				this.removeItem();
			} else {
				this.model.save({
					name: name,
					url: url
				});
			}

			this.$el.removeClass("editing");
		},

		updateOnEnter: function (e) {
			if (e.keyCode == 13) this.saveChanges();
		},

		removeItem: function () {
			this.model.destroy();
		}
	});

	//
	// Application
	// -----------------------

	var AppView = Backbone.View.extend({

		el: $("#app"),

		events: {
			"click #add-item-show-form": "showForm",
			"click #add-item": "createItem",
			"keypress #name, #url": "createOnEnter"
		},

		initialize: function () {

			this.listenTo(Items, 'add', this.addOne);
			this.listenTo(Items, 'reset', this.addAll);
			this.listenTo(Items, 'all', this.render);

			this.main = $('#main');
			this.form = this.$el.find('#add-item-form');
			this.name = this.form.find('#name');
			this.url = this.form.find('#url');

			Items.fetch();
		},

		render: function () {
			this.main.show();
		},

		showForm: function () {
			$(".editing").removeClass("editing");
			this.form.toggle();
		},

		addOne: function (item) {
			var view = new ItemView({model: item});
			this.$("#items-list").append(view.render().el);
		},

		addAll: function () {
			Items.each(this.addOne, this);
		},

		createItem: function () {
			if (!this.name.val()) return;
			if (!this.url.val()) return;

			Items.create({
				name: this.name.val(),
				url: validateURL(this.url.val())
			});

			this.name.val('');
			this.url.val('');
			this.form.hide();
		},

		createOnEnter: function (e) {
			if (e.keyCode != 13) return;

			this.createItem();
		}
	});

	var App = new AppView;



	//
	// Helpers
	// -----------------------

	function validateURL (url) {
		if(!url) return false;

		if(!new RegExp(/^(ht|f)tps?:\/\//).test(url)) {
			url = "http://" + url;
		}

		return url;
	}
});
