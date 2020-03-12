export default function createPopup(
  message,
  height,
  duration,
  type = "",
  ...rows
) {
  var styles = {
    error: ["#ff8888", "#880000", "Error".bold()],
    success: ["#88ff88", "#008800", "Success!".bold()],
    offline: ["#8888ff", "#000088", "Offline".bold()],
    default: ["#000000", "#888888", ""]
  };
  if (!(type in styles)) {
    type = "default";
  }

  //Creates and appends an element to the DOM to enable jQuery manipulation
  var popup = document.createElement("div");
  popup.setAttribute("class", "popupWindow");
  document.body.appendChild(popup);

  //Creates and appends the primary text element to the popup
  var content = document.createElement("p");
  content.innerHTML = styles[type][2] + " " + message;
  popup.appendChild(content);

  //Appends the remaining rows to the popup.
  //NOTE: rows is actually a 2d array. It's an array of length 1 with an array of strings in it. Hence the rows[0][i] reference.

  //If rows has any content
  if (rows != null && rows.length > 0) {
    //Create a new paragraph element to contain the remaining rows
    var additionalContent = document.createElement("p");
    //Add all the rows and separate them with a <br> tag.
    for (var i = 0; i < rows[0].length; i++) {
      additionalContent.innerHTML +=
        rows[0][i].toString().replace(",", "") + "<br>";
    }
    //Append the paragraph element to the popup
    content.appendChild(additionalContent);
  }

  //Setup jQuery and CSS manipulation
  //var jpopup = $(".popupWindow:last");
  var jpopup = document.querySelectorAll(".popupWindow:last-child")[0];
  jpopup.style.opacity = "0";
  jpopup.style.top = `${height}vh`
  jpopup.style.background = styles[type][0];
  jpopup.style.color = styles[type][1];
  jpopup.style.borderColor = styles[type][1];

  //Enable dismissal of popup by clicking
  document.querySelectorAll(".popupWindow:last-child")[0].click(function() {
    jpopup.stop();
    jpopup.animate(
      {
        opacity: "0"
      },
      300,
      function(e) {
        jpopup.remove();
      }
    );
  });

  let opa = 0;
  let id = setInterval(fadeIn, 10);

  /*   //Animation function
  jpopup.animate(
    {
      opacity: "1"
    },
    500,
    function(e) {
      setTimeout(
        function(e) {
          jpopup.animate(
            {
              opacity: 0
            },
            300,
            function(e) {
              jpopup.remove();
              if (callback != undefined) {
                callback();
              }
            }
          );
        },
        duration == null ? 3000 : duration
      );
    }
  ); */

  function fadeIn() {
    if (opa >= 1) {
      clearInterval(id);
      setTimeout(() => id=setInterval(fadeOut, 10), duration);
    } else {
      opa += 0.05;
      jpopup.style.opacity = opa;
    }
  }
  function fadeOut() {
    if (opa <= 0) {
      clearInterval(id);
      jpopup.remove();
    } else {
      opa -= 0.05;
      jpopup.style.opacity = opa;
    }
  }

  /*     //Animation function
      jpopup.animate({
          top: "0"
      }, 300, function(e){
          setTimeout(function(e){
              jpopup.animate({
                  top: "-"+jpopup.height() * 1.5+"px"
              }, 300, function(e){
                  jpopup.remove();
                  if(callback != undefined){
                      callback();
                  }
              })
          },((duration == null) ? 3000 : duration ));
      }); */
}
