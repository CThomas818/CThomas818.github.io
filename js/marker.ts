

class Marker {

  constructor(public name: string, public content: string, public latitude: object, public longitude: object, public _id: string){

  }
  create_content(){
    var content_string = '<div style="text-align: right;"><i id="edit-button" class="fa fa-pencil" aria-hidden="true" style="cursor: pointer; padding-right: 14px;"></i>' +
    '<i id="delete-button" class="fa fa-trash-o" aria-hidden="true" style="cursor: pointer;"></i></div>' +
    '' +
    '<b>'+this.name+'</b>' +
    '<br><br>' +
    this.content;

    return content_string;

  }
  create_form(){

    var _id = this._id;

    var form_string = '<form id="myForm" method="post" action="https://radiant-mesa-71731.herokuapp.com/locations/'+_id+'">' +
         '<input id="name-field" type="text" name="name" placeholder = "Where did you visit?">' +
         '<br>' +
         '<textarea id="content-field" type="text" name="content" style="height: 100px; width: 250px" placeholder="Say something about this place!"></textarea>' +
         '<br>' +
         '<input type="submit" value="Submit">' +
       '</form>';

      return form_string;

  }
  add_listeners(infowindow: any){

    var content_string = this.create_content();
    var form_string = this.create_form();
    var _id = this._id;
    var name = this.name;
    var content = this.content;
    var that = this;

    //Deleting a marker.
    $('#delete-button').on('click', function(){
      $.ajax({
        url: "https://radiant-mesa-71731.herokuapp.com/locations/"+ _id,
        type: "DELETE",
        success: function(result){
          //Refresh or something
          console.log("removed marker: "+_id);
        }
      });
    })

    $('#edit-button').on('click', function(){
      infowindow.setContent(form_string);

      //Making a Jquery post for submitting a form to the api, updating the infowindow with new content.
      $('#myForm').on('submit', function(){
        $.post($(this).attr('action'), $(this).serialize(), function(response){
           //Refresh or something.
           console.log("edited marker: "+name);
        },'json');
        return false;
      });

     if(name != "New Place" || content != "Write about your memories here!"){
       $('#name-field').val(name);
       $('#content-field').val(content);
     }



   })

  }
  get_id(){
    return this._id;
  }


}
