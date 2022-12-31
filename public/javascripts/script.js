//FORM VALIDATION
// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })
})()

//SIGNUP FORM VALIDATING
function signupValidate() {
  const firstname = document.getElementById("fname");
  const lastname = document.getElementById("lname");
  const email = document.getElementById("email");
  const phnumber = document.getElementById("phonenumber");
  const pass1 = document.getElementById("password-1");
  const pass2 = document.getElementById("password-2");
  const error = document.getElementsByClassName("invalid-display");

  lastname.style.border = "1px solid green";


  // email validation
  if (
    !email.value
      .trim()
      .match(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      )
  ) {
    error[0].style.display = "block";
    error[0].innerHTML = "Enter valid email address";
    email.style.border = "2px solid red";
    return false;
  } else {
    error[0].innerHTML = "";
    email.style.border = "2px solid green";
  }

  //mobile number validation
  if (phnumber.value.trim() == "" || phnumber.value.length < 9) {
    error[1].style.display = "block";
    error[1].innerHTML = "Enter valid phone number ";
    phnumber.style.border = "2px solid red";
    return false;
  } else {
    error[1].innerHTML = "";
    error[1].style.border = "2px solid green";
  }

  //password validation
  if (pass1.value.trim() === "" || pass1.value.length < 8) {
    error[2].style.display = "block";
    error[2].innerHTML = "password must be 8 character";
    pass1.style.border = "2px solid red";
    return false;
  } else {
    error[2].innerHTML = "";
    pass1.style.border = "2px solid green";
  }

  if (pass1.value === pass2.value) {
    error[3].style.display = "block";
    error[3].innerHTML = "";
    pass2.style.border = "2px solid green";
    return false;
  } else {
    error[3].style.display = "block";
    error[3].innerHTML = "Passwords do not match";
    pass2.style.border = "2px solid red";
  }
  return true;
}
function otpValidation() {
  let otp = document.getElementById("otp");
  let err = document.getElementsByClassName("error");

  if (otp.value.trim() === "" || otp.value.length === 5) {
    err.style.display = "block";
    err.innerHTML = "Enter OTP";
    return false;
  } else {
    err.innerHTML = "";
  }
  return true;
}


$(document).ready(function () {
  $(".block__pic").imagezoomsl({
    zoomrange: [3, 3],
  });
});

//USER ORDER CANCEL this is workingggggg
function cancelOrder(orderId) {
 
  swal({
    title: "Are you sure?",
    text: "Do you want to cancel the order",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Yes, Cancel my order",
    cancelButtonText: "No, cancel please!",
    closeOnConfirm: false,
    closeOnCancel: true
  },
    function (isConfirm) {
      if (isConfirm) {
        console.log('qqqqqqqqqqqqhi')
        $.ajax({
          url: '/users/cancel-order',
          method: 'post',
          data: {
            orderId

          },
          success: (response) => {
            if (response.status) {
              location.reload()

            } else {
              return false
            }
          }
        })
      }
    }
  );
}

//DASHBOARD CHART

window.addEventListener('load', () => {
  histogram(1, 'daily')
})

function histogram(days, buttonId) {
  console.log(days, 'kkkkkkkkkk');
  $.ajax({
    url: '/admin/dashboard/' + days,
    method: 'get',
    success: (response) => {

      if (response) {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
          button.classList.remove('active');
        });
        document.getElementById(buttonId).classList.add("active");

        let totalOrder = response.deliveredOrders + response.shippedOrders + response.placedOrders

        document.getElementById('totalOrders').innerHTML = totalOrder
        document.getElementById('placedOrders').innerHTML = response.placedOrders
        document.getElementById('deliveredOrders').innerHTML = response.deliveredOrders
        document.getElementById('totalAmount').innerHTML = response.totalAmount

        var xValues = ["Delivered", "Shipped", "Placed", "Pending", "Canceled"];
        var yValues = [response.deliveredOrders, response.shippedOrders, response.placedOrders, response.pendingOrders, response.canceledOrders];
        var barColors = ["green", "blue", "orange", "brown", "red"];

        new Chart("order", {
          type: "bar",
          data: {
            labels: xValues,
            datasets: [{
              backgroundColor: barColors,
              data: yValues
            }]
          },
          options: {
            legend: { display: false },
            title: {
              display: true,
              text: "Order Report"
            }
          }
        });


        var xValues = ["COD", "ONLINE"];
        var yValues = [response.codTotal, response.onlineTotal];

        var barColors = [
          "#b91d47",
          "#00aba9",
        ];

        new Chart("payment", {
          type: "pie",
          data: {
            labels: xValues,
            datasets: [{
              backgroundColor: barColors,
              data: yValues
            }]
          },
          options: {
            title: {
              display: true,
              text: "Payment Report"
            }
          }
        });



        // var xValues = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
        // var yValues = [0, response.users];

        // new Chart("user", {
        //     type: "line",
        //     data: {
        //         // labels: xValues,
        //         datasets: [{
        //             fill: true,
        //             lineTension: 0,
        //             // backgroundColor: "rgba(0,0,255,1.0)",
        //             borderColor: "rgba(0,0,255,0.1)",
        //             data: yValues
        //         }]
        //     },
        //     options: {
        //         legend: { display: false },
        //         scales: {
        //             yAxes: [{ ticks: { min: 0, max: 10 } }],
        //         },
        //         title: {
        //             display: true,
        //             text: "Users Signed"
        //         }
        //     }
        // });
      }
    }
  })
}

//ADD TO CART  
function addtocart(prodId) {
  $.ajax({
    url: "/users/add-to-cart/" + prodId,
    type: "get",
    success: (response) => {
      if (response.status) {
        let count = $("#cart-count").html();
        count = parseInt(count) + 1;
        $("#cart-count").html(count);
        //popup
        document.getElementById("success").classList.remove("d-none");
        setTimeout(function () {
          document.getElementById("success").classList.add("d-none");
        }, 1000);
      } else {
        location.href = "/login";
      }
    },
  });
}
// Add to wishlist
function addToWishlist(proId) {
  console.log(proId);
  $.ajax({
    url: '/users/add-to-wishlist/' + proId,
    method: 'get',
    success: (response) => {
      if (response.status) {
        document.getElementById('add' + proId).classList.add("d-none")
        document.getElementById('remove' + proId).classList.remove("d-none")
      } else {
        document.getElementById('remove' + proId).classList.add("d-none")
        document.getElementById('add' + proId).classList.remove("d-none")
      }
    }
  })
}

//ADD COUPON
$("#addCoupon").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: '/admin/add-coupon',
    method: 'post',
    data: $("#addCoupon").serialize(),
    success: (response) => {
      if (response.status) {
        location.reload()
      } else {
        swal({
          title: "There is Already a Coupon....!",
          text: "Your will not be able to create an existing COUPON",
          type: "warning",
          confirmButtonColor: "red",
          confirmButtonClass: "btn-danger",
          confirmButtonText: "Ok",
          closeOnConfirm: true
        })
      }
    }
  })
})

//DELETE COUPON
function deleteCoupon(coupon) {
  $.ajax({
    url: '/admin/delete-coupon/',
    type: 'post',
    data: ({ coupon }),
    success: (response) => {
      swal({
        title: "Are you sure?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "red",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        closeOnConfirm: false,
        closeOnCancel: true
      },
        function (isConfirm) {
          if (isConfirm) {
            location.reload()
          }
        }
      )
    }
  })
}

 //ADMIN ORDER STATUS
 function statusChange( orderId,status) {
  console.log('ccccccccccoooooooooo---------------')
  var status = document.getElementById(orderId+1).value;
  console.log(status,orderId)
  swal({
      title: "Are you sure?",
      text: "Do you want to " + status + " the order",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, " + status + " it!",
      cancelButtonText: "No!",
      closeOnConfirm: true,
      closeOnCancel: true
  },
      function (isConfirm) {
          if (isConfirm) {
              $.ajax({
                  url: '/admin/order-status',
                  data: {
                      orderId,
                      status
                  },
                  method: 'post',
                  success: (response) => {
                      if (response.status) {
                          document.getElementById(orderId).innerHTML = status
                          if (status == 'pending' || status == 'placed' || status == 'shipped' || status == 'delivered' || status == 'canceled') {
                              location.reload()
                          }
                      }
                  }
              })
          } else {
              location.reload()
          }
      }
  );
}


// /PDF AND EXCEL//
$(document).ready(function ($) {
  $(document).on('click', '.btn_print', function (event) {
    event.preventDefault();
    var element = document.getElementById('container_content');

    let randomNumber = Math.floor(Math.random() * (10000000000 - 1)) + 1;

    var opt =
    {
      margin: 0,
      filename: 'pageContent_' + randomNumber + '.pdf',
      html2canvas: { scale: 10 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  });
});

function export_data() {
  let data = document.getElementById('container_content');
  var fp = XLSX.utils.table_to_book(data, { sheet: 'vishal' });
  XLSX.write(fp, {
    bookType: 'xlsx',
    type: 'base64'
  });
  XLSX.writeFile(fp, 'test.xlsx');
}