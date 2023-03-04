//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://Erif314:bigblackcock69@cluster0.l7zszi4.mongodb.net/todolistDB");


const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "check your data entry"]
  }
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "cake"
});

const item2 = new Item({
  name: "ice cream"
});

const item3 = new Item({
  name: "chips"
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItem) {
    if (foundItem.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log("got an error plz check");
        } else {
          console.log("saved to collection ");
        }
      });
      res.redirect("/");

    } else {
      res.render("list", {
        listTitle: "today",
        newListItems: foundItem
      });
    }

  });


});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  // for adding new items to our ToDoListv2
  if (listName === "today") {
    item.save();

    res.redirect("/");
  } else { // if the list name was from custom list
    List.findOne({
      name: listName
    }, function(err, foundList) {

      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Successfully deleted checked items");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
        name: listName
      }, {
        $pull: {
          items: {
            _id: checkedItemId
          }
        }
      },
      function(err, foundItem) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }

    );
  }


});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    }
  })
});



app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode");
});
