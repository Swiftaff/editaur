<script>
    import imported_rows from "./test_data.js";
    let rows = [];
    let main;
    let caret;
    let highlighted_row;
    let benchmark;
    let max_text_width = 0;
    let selection = { start: { r: 0, c: 0 }, end: { r: 0, c: 0 }, in_progress: false, rows: [] };
    let cursor = { r: 0, c: 0 };
    let previous_c = 0;
    let pressing_shift = false;
    let pressing_control = false;
    let scrollTop = 0;
    const SHIFT_SCROLL_DEFAULT = 3;
    const SHIFT_SCROLL_MULTIPLIER = 5;
    let LINE_HEIGHT = 0;
    let CHAR_WIDTH = 0;
    let CHAR_WIDTH_THIRD = 0;
    let CARET_WIDTH = 0;
    let TEXT_LEFT = 0;
    let TEXT_TOP = 0;
    let b;
    let ct;
    let m;

    $: if (main) {
        m = main.getBoundingClientRect();
        max_text_width = m.width - 177;

        // get sizes based on actual font size;
        b = benchmark.getBoundingClientRect();
        ct = caret.getBoundingClientRect();
        TEXT_LEFT = Math.floor(m.left - b.left);
        TEXT_TOP = Math.floor(m.top - b.top);
        CHAR_WIDTH = Math.floor((m.left - b.width) / 5);
        CHAR_WIDTH_THIRD = Math.floor(CHAR_WIDTH / 3);
        CARET_WIDTH = Math.floor(CHAR_WIDTH / 5);
        LINE_HEIGHT = Math.floor(b.height / 5);
        rows = imported_rows.map((text) => {
            return { text, w: Math.floor(text.length * CHAR_WIDTH) };
        });
        caret_update(0, 0);
    }

    /*
  function selection_start(e) {
      // get row and column based on mouse position and fixed width characters, but allow overlap of a third of char width to select next column so it feels right
      const { r, c } = get_r_c_from_mouse(e);
      selection.start = { r, c };
      selection.end = { r, c };
      selection.in_progress = true;
      //let { x, y, height } = e.target.parentElement.getBoundingClientRect();
      //let width = rows[r].text.length * CHAR_WIDTH;
      //let h = width > max_text_width ? Math.floor(width / max_text_width) + 1 : 1;
      caret_update(r, c);
  }
  function selection_stop(e) {
      selection.in_progress = false;
  }
  function get_r_c_from_mouse(e) {
      let c = Math.floor((e.clientX - TEXT_LEFT + CHAR_WIDTH_THIRD) / CHAR_WIDTH);
      let r = Math.floor((e.clientY - TEXT_TOP) / LINE_HEIGHT);
      if (c > rows[r].text.length - 1) c = rows[r].text.length;
      if (c < 0) c = 0;
      return { c, r };
  }
  */
    function get_x_y_from(r, c) {
        let x = Math.floor(c * CHAR_WIDTH + TEXT_LEFT);
        let y = Math.floor(r * LINE_HEIGHT - TEXT_TOP);
        return { x, y };
    }

    function caret_update(r, c) {
        cursor = { r, c };
        const { x, y } = get_x_y_from(r, c);
        caret.style = `width: ${CARET_WIDTH}px; left: ${x}px; top: ${y}px;`;
        console.log("m", m);
        console.log("b", b);
        console.log("ct", ct);
        //caret.style, TEXT_LEFT,
        //highlighted_row.style = `top: ${y}px;`;
    }
    /*
  function selection_update(e) {
      if (selection.in_progress) {
          const { r, c } = get_r_c_from_mouse(e);
          selection.end = { r, c };
          cursor = { r, c };
          let num_rows = selection.end.r - selection.start.r;
          if (num_rows == 0) {
              selection.rows = [
                  {
                      ...get_x_y_from(selection.start.r, selection.start.c),
                      w: get_x_y_from(selection.end.r, selection.end.c - selection.start.c + 1).x - TEXT_LEFT,
                      h: LINE_HEIGHT,
                  },
              ];
          }
          */

    /* else {
              first_row = {
                  ...first,
                  w: (rows[selection.start.r].text.length - selection.start.c) * CHAR_WIDTH,
              };
              let new_rows = [first_row];

              for (let index = 0; index < num_rows; index++) {
                  let width = rows[selection.start.r + index + 1].text.length * CHAR_WIDTH;
                  let h = 1;
                  if (width > max_text_width) {
                      h = Math.floor(width / max_text_width) + 1;
                      width = max_text_width;
                  }

                  if (index == num_rows - 1) {
                      new_rows.push({
                          x: 105,
                          y: first.y,
                          w: selection.end.c * CHAR_WIDTH,
                          h,
                      });
                  } else {
                      new_rows.push({
                          x: 105,
                          y: first.y,
                          w: width,
                          h,
                      });
                  }
              }
              selection.rows = new_rows;
          }*/

    /*
      }
  }
  function handle_key_down(e) {
      //console.log("key:", e.key);
      switch (e.key) {
          case "ArrowDown":
              arrow_down();
              break;
          case "ArrowUp":
              arrow_up();
              break;
          case "ArrowLeft":
              arrow_left();
              break;
          case "ArrowRight":
              arrow_right();
              break;
          case "Shift":
              shift_key_down();
              break;
          case "Control":
              control_key_down();
              break;
          case "Enter":
              enter();
              break;
          case "Delete":
              del();
              break;
          case "Backspace":
              backspace();
              break;
          default:
              insert(e.key);
              break;
      }
  }
  function handle_key_up(e) {
      //console.log("key:", e.key);
      if (e.key == "Shift") shift_key_up();
      if (e.key == "Control") control_key_up();
  }
  function insert(char) {
      //console.log("insert", char);
      if (!pressing_control && char.length == 1) {
          let { r, c } = cursor;
          let new_rows = [...rows];
          new_rows[r].text = new_rows[r].text.slice(0, c).concat(char, new_rows[r].text.slice(c));
          cursor = { r, c: c + 1 };
          rows = new_rows;
          scroll_up();
          scroll_down();
          caret_update(r, c);
      }
  }
  function backspace() {
      //console.log("Backspace");
      let { r, c } = cursor;
      let new_rows = [...rows];
      if (c == 0) {
          //console.log("start of line");
          if (r > 0) {
              cursor = { r: r - 1, c: new_rows[r - 1].text.length };
              new_rows[r - 1].text = new_rows[r - 1].text.concat(new_rows[r].text);
              new_rows.splice(r, 1);
          }
      } else if (c == rows[r].text.length) {
          //console.log("eol");
          new_rows[r].text = new_rows[r].text.slice(0, c - 1).concat(new_rows[r].text.slice(c));
          cursor = { r, c: c - 1 };
      } else {
          //console.log("mid line");
          new_rows[r].text = new_rows[r].text.slice(0, c - 1).concat(new_rows[r].text.slice(c));
          cursor = { r, c: c - 1 };
      }
      rows = new_rows;
      scroll_up();
      scroll_down();
      caret_update(r, c);
  }
  function del() {
      //console.log("Delete");
      let { r, c } = cursor;
      let new_rows = [...rows];
      if (c == 0) {
          //console.log("start of line");
          new_rows[r].text = new_rows[r].text.slice(c + 1);
      } else if (c == rows[r].text.length) {
          //console.log("eol");
          if (new_rows.length > r + 1) {
              new_rows[r].text = new_rows[r].text.concat(new_rows[r + 1].text);
              new_rows.splice(r + 1, 1);
          }
      } else {
          //console.log("mid line");
          new_rows[r].text = new_rows[r].text.slice(0, c).concat(new_rows[r].text.slice(c + 1));
      }
      rows = new_rows;
      scroll_up();
      scroll_down();
      caret_update(r, c);
  }
  function enter() {
      //console.log("Enter");
      let { r, c } = cursor;
      let new_rows = [...rows];
      if (c == 0) {
          //console.log("start of line");
          new_rows.splice(r, 0, { text: "", w: 0 });
      } else if (c == rows[r].text.length) {
          //console.log("eol");
          new_rows.splice(r + 1, 0, { text: "", w: 0 });
      } else {
          //console.log("mid line");
          let first_half = new_rows[r].text.substring(0, c);
          let second_half = new_rows[r].text.substring(c, new_rows[r].text.length);
          new_rows[r].text = first_half;
          new_rows.splice(r + 1, 0, { text: second_half, w: second_half.length * CHAR_WIDTH });
      }
      cursor = { r: r + 1, c: 0 };
      rows = new_rows;
      scroll_down();
      caret_update(r, c);
  }
  function shift_key_down() {
      if (!pressing_shift) pressing_shift = true;
  }
  function shift_key_up() {
      pressing_shift = false;
  }
  function control_key_down() {
      if (!pressing_control) pressing_control = true;
  }
  function control_key_up() {
      pressing_control = false;
  }
  function arrow_down() {
      let { r, c } = cursor;
      scroll_down();
      if (r < rows.length - 1) {
          r = r + 1;
          c = move_caret_to_eol_if_shorter_than_previous(r, c);
          c = move_caret_back_to_previous_if_line_is_long_enough(r, c);
      } else {
          c = move_caret_to_end_and_reset_previous_if_moving_down_from_within_bottom_line(r, c);
      }
      cursor = { r, c };
      caret_update(r, c);
  }
  function arrow_up() {
      let { r, c } = cursor;
      scroll_up();
      if (r > 0) {
          r = r - 1;
          c = move_caret_to_eol_if_shorter_than_previous(r, c);
          c = move_caret_back_to_previous_if_line_is_long_enough(r, c);
      } else {
          c = move_caret_to_start_and_reset_previous_if_moving_up_from_within_top_line(r, c);
      }
      cursor = { r, c };
      caret_update(r, c);
  }
  function move_caret_to_eol_if_shorter_than_previous(r, c) {
      if (c > rows[r].text.length) {
          previous_c = c;
          c = rows[r].text.length;
      }
      return c;
  }
  function move_caret_back_to_previous_if_line_is_long_enough(r, c) {
      if (c < previous_c && previous_c <= rows[r].text.length) c = previous_c;
      return c;
  }
  function move_caret_to_start_and_reset_previous_if_moving_up_from_within_top_line(r, c) {
      if (c > 0) {
          c = 0;
          previous_c = 0;
      }
      return c;
  }
  function move_caret_to_end_and_reset_previous_if_moving_down_from_within_bottom_line(r, c) {
      if (c < rows[r].text.length) {
          c = rows[r].text.length;
          previous_c = rows[r].text.length;
      }
      return c;
  }
  function arrow_left() {
      let { r, c } = cursor;
      if (c > 0) {
          c = c - 1;
          cursor = { r, c };
          previous_c = 0;
      } else if (r > 0) {
          r = r - 1;
          c = rows[r].text.length;
          previous_c = 0;
          cursor = { r, c };
      }
      caret_update(r, c);
  }
  function arrow_right() {
      let { r, c } = cursor;
      if (c < rows[cursor.r].text.length) {
          c = c + 1;
          cursor = { r, c };
          previous_c = 0;
      } else if (r < rows.length - 1) {
          r = r + 1;
          c = 0;
          previous_c = 0;
          cursor = { r, c };
      }
      caret_update(r, c);
  }
  function scroll_up(wheel = false) {
      let caret_pos = caret.getBoundingClientRect();
      let main_pos = main.getBoundingClientRect();
      if (!wheel && caret_pos.top < 0) scroll_offscrn_above(caret_pos);
      else if (!wheel && caret_pos.top > main_pos.height) scroll_offscrn_below(caret_pos, main_pos);
      else if (wheel || caret_pos.top < caret_pos.height) scroll_onscrn(caret_pos, wheel);
  }
  function scroll_down(wheel = false) {
      let caret_pos = caret.getBoundingClientRect();
      let main_pos = main.getBoundingClientRect();
      if (!wheel && caret_pos.top < 0) scroll_offscrn_above(caret_pos, true);
      else if (!wheel && caret_pos.top > main_pos.height) scroll_offscrn_below(caret_pos, main_pos, true);
      else if (wheel || caret_pos.top + caret_pos.height > main_pos.height) scroll_onscrn(caret_pos, wheel, true);
  }
  function scroll_onscrn(caret_pos, wheel, down = false) {
      let direction = down ? 1 : -1;
      main.scrollTo(
          0,
          main.scrollTop +
              direction *
                  (caret_pos.height * (wheel ? (pressing_shift ? SHIFT_SCROLL_MULTIPLIER : SHIFT_SCROLL_DEFAULT) : 1))
      );
  }
  function scroll_offscrn_above(caret_pos, down = false) {
      let direction = down ? 1 : -1;
      main.scrollTo(
          0,
          main.scrollTop +
              Math.floor(caret_pos.top / caret_pos.height) * caret_pos.height +
              caret_pos.height * direction
      );
  }
  function scroll_offscrn_below(caret_pos, main_pos, down = false) {
      let direction = down ? 2 : 1;
      main.scrollTo(
          0,
          main.scrollTop +
              Math.floor(caret_pos.top / caret_pos.height) * caret_pos.height +
              caret_pos.height * direction -
              main_pos.height
      );
  }
  function wheel(node, _options) {
      const handler = (e) => {
          e.preventDefault();
          if (e.deltaY < 0) scroll_up(true);
          else scroll_down(true);
          scrollTop = main ? main.scrollTop : 0;
      };

      node.addEventListener("wheel", handler, { passive: false });

      return {
          destroy() {
              node.removeEventListener("wheel", handler, { passive: false });
          },
      };
  }
  */
</script>

<!--<svelte:window
  on:keydown|preventDefault={handle_key_down}
  on:keyup|preventDefault={handle_key_up}
  use:wheel={true}
  on:mousedown={selection_start}
  on:mouseup={selection_stop}
  on:mousemove={selection_update}
/>-->
<!-- <div class="selection_parent" style={`top: ${-scrollTop}px;`} > -->

<main bind:this={main}>
    <div class="selection_parent">
        <!--{#each selection.rows as row}<div
              class="selection"
              style={`left: ${row.x}px; top: ${row.y}px; width: ${row.w}px; height: ${row.h}px`}
          />{/each}-->
        <i bind:this={caret} />
        <!--<div class="highlighted_row" bind:this={highlighted_row} />-->
    </div>
    <!--
  <div class="nums">
      {#each rows as row, r}
          <div>{1000 + r}:</div>
      {/each}
  </div>
  -->

    <div class="text">
        <div id="benchmark" bind:this={benchmark}>XXXXX<br />XXXXX<br />XXXXX<br />XXXXX<br />XXXXX</div>
        <!--{#each rows as row, r}
          <div style={`width: ${row.w}px`}>{row.text}</div>
      {/each}-->
    </div>
</main>
<pre>{JSON.stringify(
        { caret: caret && caret.style, c: ct && ct.left, b, CHAR_WIDTH, LINE_HEIGHT, selection },
        null,
        " "
    )
        .replace(/: \{\n\s+/g, ": {")
        .replace(/{\n\s+\"/g, '{ "')
        .replace(/: {+/g, ":\n{")
        .replace(/\n\s+}/g, "}")
        .replace(/,\n/g, ",")
        .replace(/},\s+{/g, "},\n  {")
        .replace(/\n\s+\},/g, "},\r\n")}</pre>
