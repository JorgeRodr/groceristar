'use strict';

var _ = require('underscore');


module.exports = function(Grocery) {

	Grocery.validatesPresenceOf(
		// 'departments',
		'img', 'desc', 'slug'
	);

	Grocery.observe('update', function(ctx, next){
		ctx.instance.updated_at = new Date();
        next();
	});

	Grocery.observe("before save", function updateTimestamp(ctx, next) {

		if( ctx.isNewInstance ){
			ctx.instance.created_at = new Date();
			ctx.instance.updated_at = new Date();
		} 



		next();
	});

	// when we call this method - we know that this grocery is attached to user,
	// so it's not so important to check relations between this grocery and user

	Grocery.fetchById = function(groceryId, cb){

		Grocery.findById(groceryId, {		
			include: {
				relation: 'ingredients',
				scope: {

					// fields: [ 'id', 'name', 'department' ],
					include: {
						relation: 'department',
						scope: {
							// fields: [ 'id', 'name' ],
							// fields: [ 'name' ],
							// where: {
							// 	departmentId: id
							// }
						}
					}

				}
			}

		}, function(err, grocery){


			var g = grocery.toJSON();

			
 				var response = {};
                var uniques = _.map(_.groupBy(g.ingredients, function(item){
                	// console.log(item);
                  return item.department.id.toString();
                }), function(grouped){

            		 var ja = _.map(grouped, function(item){
            		 	// return item.name
            		 	
            		 	return [item.id, item.name]
            		 });

                		

                    return { id: grouped[0].department.id.toString(),
                            name: grouped[0].department.name,
                            type: grouped[0].department.type,
                            ingredients: ja,
                            // ingid:  grouped[0].id 
                        };

                });
                

                response = {
                    id: g.id,
                    title: g.title,
                    data: uniques
                };

           

			cb(null, response);

		});



	};

	// :todo not sure what i mean by this.
	// not working now. Can be used for query ONLY
	Grocery.fetch = function(cb){


		Grocery.find({
			include: {
				relation: 'ingredients',
				scope: {
					// fields: [ 'name' ],
					include: {
						relation: 'department',
						scope: {
							// fields: [ 'name' ],
							// where: {
							// 	departmentId: id
							// }
						}
					}

				}
			}

		}, function(err, models){

			console.log(models);

			// _.map()

			// var g = grocery.toJSON();
			
			var response = [];
			// console.log(g.desc);
			// console.log(g.departmentsList);


			// _.map( g.ingredients, function(ingredient){

				// console.log(ingredient);
				// console.log(ingredient.department);

                // var uniques = _.map(_.groupBy(g.ingredients, function(item){
                //   return item.department.id.toString();
                // }), function(grouped){

                //     return {  
                //     		id: grouped[0].department.id.toString(),
                //             name: grouped[0].department.name,
                //             link: '#'
                //         };

                // });
                // console.log(uniques);

                // response.push({
                //     id: grocery.id,
                //     title: grocery.title,
                //     departments: uniques
                // });

                
            // });



			// case #1 return only dep name with id for link creation
			// g.departmentsList.forEach(function(item, i){

				// case #1 return only dep name with id for link creation
				// console.log(item.name);
				// console.log(item.id);
				// console.log(item.visible);
				// console.log(item.ingredients.length > 0);
				// departments.push({ id: item.id, name: item.name });

				
			// });




			// console.log(departments);
			// object.departments = departments;

			// case #2 display deps with ings
			// g.departmentsList.forEach(function(item, i){
			// 	// console.log(item);

			// 	console.log(item.name);
			// 	console.log(item.id);
			// 	console.log(item.visible);
			// 	console.log(item.ingredients.length > 0);

			// 	// console.log(item.ingredients);

				
			// })

			
			// var object = {
			// 	desc: g.desc,
			// 	departments:departments
			// };
			// cb(null, object);
				

		});


	};






	//:todo add remote method for enable API calls for this method


	Grocery.clone = function(groceryId, userId){

		// Grocery.attachToUser(groceryId, userId);
		Grocery.findById(groceryId, {
			include: ['ingredients', 'departmentsToHide']
			
		}, function(err, grocery){


			//:todo use createnew method instead of duplicate stuff

			var object = {
				title: 'Clone of <' + grocery.title + '>',
				desc: grocery.desc,
				slug: grocery.slug,
				img : grocery.img,
				// departmentIds: grocery.departmentIds,
				hideThisIds:   grocery.hideThisIds,
				ingredientIds: grocery.ingredientIds,
				created_at: new Date(),
				updated_at: new Date(),
			};
		

			Grocery.create(object, function(err, model){


				var User    = Grocery.app.models.user;
			    var options = {
			      type  : 'attach',
			      field : 'groceryIds',
			      userId: userId,
			      secondArray: [ model.id ]
			    };
			    User.proceed(options);
			    // console.log('-----');
			});

			



		});
		

	}

	// 	data must have this structure:
	// {
	// 	title: data.title,
	// 	desc:  data.desc,
	// 	slug:  data.slug,
	// 	img :  data.img,
	// 	departmentIds: data.departmentIds,
	// 	hideThisIds:   data.hideThisIds,
	// }



	Grocery.createnew = function(userId, data, cb){

		Grocery.create(data, function(err, model){

			console.log(model)
			// :todo check relations with other sub models

			// console.log( model.id );
			// Grocery.attachToUser(model.id, userId, function(data){

			// });

		});

	};

	Grocery.withDepartments = function(groceryId, cb){
		Grocery.findOne({
			include: {
				relation: 'departmentsList',
				scope: {
					fields: [ 'name' ],
					include: {
						relation: 'ingredients',
						scope: {
							fields: [ 'name' ],
							// where: {
							// 	departmentId: id
							// }
						}
					}

				}
			},
			where: {id:groceryId}

		}, cb);
	};


	// :todo now used right now. change this!
	Grocery.fetchQuery = function(cb){

		Grocery.find({
			include: {
				relation: 'ingredients',
				scope: {
					fields: [ 'id', 'name' ],
					include: {
						relation: 'department',
						scope: {
							fields: [ 'id', 'name', 'department' ],
							// where: {
							// 	departmentId: id
							// }
						}
					}

				}
			}

		}, cb);
	};

	//:todo think about adding count(to departments). 
	// So if ingredients in dep = 0 - don't show it
	Grocery.element = function(groceryId, cb){

		Grocery.withDepartments(groceryId, function(err, model){

			var g = grocery.toJSON();
			
			var departments = [];
			// console.log(g.desc);
			// console.log(g.departmentsList);

			// case #1 return only dep name with id for link creation
			g.departmentsList.forEach(function(item, i){

				if( item.visible ) {
					departments.push({
						 id: item.id,
						 name: item.name 
					});
				}	

				
			});
		})

	}


	Grocery.withPurchased = function(groceryId, cb){
		Grocery.findOne({
			include: {
				relation: 'purchased',
				scope: {
					fields: [ 'id', 'name' ],
					// include: {
					// 	relation: 'ingredients',
					// 	scope: {
					// 		fields: [ 'name' ],
					// 		// where: {
					// 		// 	departmentId: id
					// 		// }
					// 	}
					// }

				}
			},
			where: { id:groceryId }

		}, cb);
	};


	Grocery.secondWave = function(groceryId, cb){

		var Department = Grocery.app.models.Department;

		Grocery.findById(groceryId, {

		}, function(err, grocery){

			console.log(grocery.ingredientIds);

			var ingArr = grocery.ingredientIds;

			Department.find({
				include: {
					relation: 'ingredients',
					scope: {
						where : {
							id: {
								inq: ingArr
							}
						}
					}
				}
			}, function(err, model){

				console.log(model);
				console.log(model.ingredientIds);
				var m = model.toJSON();
				console.log(m.ingredients);

			});

		});


	};


	Grocery.addPurchased = function(options){
		options.type  = 'add';
		options.field = 'purchasedIds'
		Grocery.proceed(options);

	};
	Grocery.removePurchased = function(options){
		options.type  = 'remove';
		options.field = 'purchasedIds'
		Grocery.proceed(options);

	};
	Grocery.cleanPurchased = function(options){
		options.type  = 'clear';
		options.field = 'purchasedIds'
		Grocery.proceed(options);
	};

	Grocery.addDepartment = function(options){
		options.type  = 'hide';
		options.field = 'hideThisIds'
		Grocery.proceed(options);	
	};
	Grocery.removeDepartment = function(options){
		options.type  = 'show';
		options.field = 'hideThisIds'
		Grocery.proceed(options);		
	};
	Grocery.showAllDepartments = function(options){
		options.type  = 'all';
		options.field = 'hideThisIds'
		Grocery.proceed(options);			
	};

	Grocery.addIngredient = function(options){
		options.type  = 'add-ing';
		options.field = 'ingredientIds';
		Grocery.proceed(options);			
	};
	Grocery.removeIngredient = function(options){
		options.type  = 'remove-ing';
		options.field = 'ingredientIds';
		Grocery.proceed(options);			
	};

	// Grocery.addItem = function(options){
	// 	options.type  = 'add-item';
	// 	options.field = 'itemsIds';
	// 	Grocery.proceed(options);	
	// };
	
	// Grocery.removeItem = function(options){
	// 	options.type  = 'remove-item';
	// 	options.field = 'itemsIds';
	// 	Grocery.proceed(options);	
	// };
	Grocery.proceed = function(options){

		var type = options.type;

		Grocery.findById(options.groceryId, {}, function(err, model){


			if( options.type == 'clear' || options.type ==  'all'){

				model.updateAttribute(options.field, []);	

			}


			if( options.type == 'add' || options.type == 'hide' || options.type == 'add-ing' ){

                let arr = _.map(model[options.field], item => item.toString());

                var mergedValues = _.union( arr, options.secondArray );

                model.updateAttribute(options.field, mergedValues);

			}		


			if( options.type == 'remove' || options.type == 'show' || options.type == 'remove-ing' ){

			
                if( !model[options.field] ){ return true; }

                let arr = _.map(model[options.field], item => item.toString());

                arr = arr.filter(item => !options.secondArray.includes(item));
                // !!! Read below about array.includes(...) support !!!

                model.updateAttribute(options.field, arr);

			}

			

		});

	}

	
};
