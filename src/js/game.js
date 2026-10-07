const btn_modal_open = document.getElementById("rate-btn");
const btn_modal_close = document.getElementById("close-btn");
const overlay = document.getElementById("overlay");

btn_modal_open.addEventListener("click", () => {
  open_modal();
})

btn_modal_close.addEventListener("click", () => {
  close_modal();
})

function open_modal() {
  overlay.classList.remove("hidden");
}

function close_modal() {
  overlay.classList.add("hidden");
}
