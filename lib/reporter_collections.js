collectionCountSchemaObject = {
  collectionName: {
    type: String
  },
  totalRecords: {
    type: Number
  },
  runTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset();
      }
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true
  }
};

CollectionCount = new Mongo.Collection('collection_counts');
CollectionCountSchema = new SimpleSchema(collectionCountSchemaObject);

CollectionCount.attachSchema(CollectionCountSchema);
