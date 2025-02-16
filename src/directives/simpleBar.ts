import { type DirectiveBinding } from "vue";
import SimpleBar from "simplebar";
import "simplebar/dist/simplebar.css";

const simpleBarDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // Avoid initializing SimpleBar multiple times
    if (!el.hasAttribute("data-simplebar")) {
      new SimpleBar(el, binding.value || {});
    }
  },
};

export default simpleBarDirective;
