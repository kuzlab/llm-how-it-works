(function () {
  "use strict";

  const data = window.APP_DATA;
  if (!data) {
    console.error("APP_DATA is missing. data.js を読み込んでください。");
    return;
  }

  function deepClone(x) { return JSON.parse(JSON.stringify(x)); }

  // ====================================================================
  // タブ切り替え
  // ====================================================================
  const tabButtons = document.querySelectorAll(".tab");
  const panels = {
    tab1: document.getElementById("tab1"),
    tab2: document.getElementById("tab2"),
    tab3: document.getElementById("tab3"),
    tab4: document.getElementById("tab4")
  };

  function activateTab(name, opts) {
    if (!panels[name]) name = "tab1";
    tabButtons.forEach(btn => {
      btn.setAttribute("aria-selected", btn.dataset.tab === name ? "true" : "false");
    });
    Object.keys(panels).forEach(k => { panels[k].hidden = (k !== name); });
    if (!opts || opts.updateHash !== false) {
      const newHash = "#" + name;
      if (location.hash !== newHash) history.replaceState(null, "", newHash);
    }
    if (name === "tab3" && !meaningMap.rendered) meaningMap.render();
  }
  tabButtons.forEach(btn => btn.addEventListener("click", () => activateTab(btn.dataset.tab)));
  window.addEventListener("hashchange", () => {
    activateTab((location.hash || "#tab1").replace("#", ""), { updateHash: false });
  });

  // ====================================================================
  // 温度ロジック (§6)
  // ====================================================================
  function temper(p, T) {
    const eps = 1e-9;
    const w = p.map(x => Math.pow(x + eps, 1 / T));
    const sum = w.reduce((a, b) => a + b, 0);
    return w.map(x => x / sum);
  }
  function weightedSampleIndex(probs) {
    const r = Math.random();
    let acc = 0;
    for (let i = 0; i < probs.length; i++) {
      acc += probs[i];
      if (r <= acc) return i;
    }
    return probs.length - 1;
  }

  // ====================================================================
  // タブ1: 次の単語をあてる(候補クリックで分岐対応)
  // ====================================================================
  const t1 = {
    sentence: null,
    effectiveSteps: [], // 分岐に応じて差し替える
    stepIndex: 0,
    builtTokens: [],
    temperature: 1.0,
    autoTimer: null,
    flashTimer: null,
    diverged: false      // 用意したパスを外れたか
  };

  const t1El = {
    select:     document.getElementById("t1-sentence-select"),
    temp:       document.getElementById("t1-temp"),
    tempValue:  document.getElementById("t1-temp-value"),
    sentence:   document.getElementById("t1-sentence"),
    candidates: document.getElementById("t1-candidates"),
    next:       document.getElementById("t1-next"),
    auto:       document.getElementById("t1-auto"),
    dice:       document.getElementById("t1-dice"),
    reset:      document.getElementById("t1-reset"),
    final:      document.getElementById("t1-final")
  };

  function t1Init() {
    data.sentences.forEach((s, i) => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.title;
      if (i === 0) opt.selected = true;
      t1El.select.appendChild(opt);
    });

    t1El.select.addEventListener("change", () => {
      const s = data.sentences.find(x => x.id === t1El.select.value);
      t1LoadSentence(s);
    });
    t1El.temp.addEventListener("input", () => {
      t1.temperature = parseFloat(t1El.temp.value);
      t1El.tempValue.textContent = t1.temperature.toFixed(2);
      t1RenderCandidates();
    });
    t1El.next.addEventListener("click", () => {
      if (t1.flashTimer) { clearTimeout(t1.flashTimer); t1.flashTimer = null; }
      t1AdvanceToChosen();
    });
    t1El.auto.addEventListener("click", t1ToggleAuto);
    t1El.dice.addEventListener("click", t1RollDice);
    t1El.reset.addEventListener("click", () => {
      t1Stop();
      t1LoadSentence(t1.sentence);
    });

    t1LoadSentence(data.sentences[0]);
  }

  function t1LoadSentence(s) {
    t1Stop();
    t1.sentence = s;
    t1.effectiveSteps = deepClone(s.steps);
    t1.stepIndex = 0;
    t1.builtTokens = [];
    t1.diverged = false;
    t1El.final.hidden = true;
    t1El.final.classList.remove("diverged");
    t1El.final.innerHTML = "";
    t1RenderSentence();
    t1RenderCandidates();
    t1El.next.disabled = false;
    t1El.dice.disabled = false;
    t1El.auto.textContent = "自動再生 ⏵";
  }

  function t1RenderSentence(opts) {
    const justAddedIdx = (opts && typeof opts.justAddedIdx === "number") ? opts.justAddedIdx : -1;
    const el = t1El.sentence;
    el.innerHTML = "";
    const promptSpan = document.createElement("span");
    promptSpan.textContent = t1.sentence.prompt;
    el.appendChild(promptSpan);
    t1.builtTokens.forEach((tok, i) => {
      const w = document.createElement("span");
      w.className = "word" + (i === justAddedIdx ? " just-added" : "");
      w.textContent = tok;
      el.appendChild(w);
    });
    const finished = t1.stepIndex >= t1.effectiveSteps.length;
    if (!finished) {
      const cur = document.createElement("span");
      cur.className = "t1-cursor";
      el.appendChild(cur);
    }
  }

  function t1RenderCandidates(opts) {
    const stepIdx = t1.stepIndex;
    const finished = stepIdx >= t1.effectiveSteps.length;
    t1El.candidates.innerHTML = "";

    if (finished) {
      const full = t1.sentence.prompt + t1.builtTokens.join("");
      t1El.final.hidden = false;
      if (t1.diverged) {
        t1El.final.classList.add("diverged");
        t1El.final.innerHTML =
          "<strong>違う道で完成: </strong>" + escapeHtml(full) +
          "<br><br>ここから先は別の分岐になりましたが、" +
          "LLM はこのように <strong>確率の低い枝</strong> もたまに通ります。" +
          "毎回違う出力になるのはこのためです。";
      } else {
        t1El.final.classList.remove("diverged");
        t1El.final.innerHTML =
          "<strong>完成: </strong>" + escapeHtml(full) +
          "<br><br>LLM はこの「次の 1 語を確率で選ぶ」作業を、" +
          "何千億回と学んだ知識をもとに猛烈な速さで繰り返しているだけです。";
      }
      return;
    }
    t1El.final.hidden = true;

    const step = t1.effectiveSteps[stepIdx];
    const baseProbs = step.candidates.map(c => c.prob);
    const tempered = temper(baseProbs, t1.temperature);

    const order = step.candidates
      .map((c, i) => ({ i, base: c.prob }))
      .sort((a, b) => b.base - a.base)
      .map(o => o.i);

    const flashedIdx = (opts && typeof opts.flashedIdx === "number") ? opts.flashedIdx : -1;

    order.forEach(i => {
      const c = step.candidates[i];
      const pct = tempered[i] * 100;
      const row = document.createElement("div");
      row.className = "cand-row";
      row.dataset.token = c.token;
      row.title = "クリックでこの単語を選んで進む";
      if (c.token === step.chosen) row.classList.add("chosen");
      if (i === flashedIdx) row.classList.add("flashed");

      const tokDiv = document.createElement("div");
      tokDiv.className = "cand-token";
      tokDiv.innerHTML =
        '<span>' + escapeHtml(c.token) + '</span>' +
        (c.token === step.chosen ? '<span class="marker" title="見本の道">⬅</span>' : '');

      const bar = document.createElement("div");
      bar.className = "cand-bar";
      const span = document.createElement("span");
      span.style.width = pct.toFixed(2) + "%";
      bar.appendChild(span);

      const pctEl = document.createElement("div");
      pctEl.className = "cand-pct";
      pctEl.textContent = pct.toFixed(1) + "%";

      row.appendChild(tokDiv);
      row.appendChild(bar);
      row.appendChild(pctEl);
      row.addEventListener("click", () => t1PickToken(c.token));
      t1El.candidates.appendChild(row);
    });
  }

  function t1AdvanceToChosen() {
    if (t1.stepIndex >= t1.effectiveSteps.length) return t1Stop();
    const step = t1.effectiveSteps[t1.stepIndex];
    t1ConsumeStep(step.chosen);
  }

  function t1PickToken(token) {
    if (t1.stepIndex >= t1.effectiveSteps.length) return;
    if (t1.flashTimer) { clearTimeout(t1.flashTimer); t1.flashTimer = null; }
    if (t1.autoTimer) t1Stop();
    const step = t1.effectiveSteps[t1.stepIndex];

    // 元の道と違う候補をクリック → 分岐
    if (token !== step.chosen) {
      step.chosen = token;
      const branch = step.branches && step.branches[token];
      if (branch) {
        t1.effectiveSteps = t1.effectiveSteps.slice(0, t1.stepIndex + 1).concat(deepClone(branch));
      } else {
        // 分岐データがない: ここで終わり扱い
        t1.effectiveSteps = t1.effectiveSteps.slice(0, t1.stepIndex + 1);
      }
      t1.diverged = true;
    }
    t1ConsumeStep(token);
  }

  function t1ConsumeStep(token) {
    t1.builtTokens.push(token);
    t1.stepIndex += 1;
    t1RenderSentence({ justAddedIdx: t1.builtTokens.length - 1 });
    t1RenderCandidates();
    if (t1.stepIndex >= t1.effectiveSteps.length) {
      t1El.next.disabled = true;
      t1El.dice.disabled = true;
      if (t1.autoTimer) t1Stop();
    }
  }

  function t1ToggleAuto() {
    if (t1.autoTimer) return t1Stop();
    if (t1.stepIndex >= t1.effectiveSteps.length) t1LoadSentence(t1.sentence);
    t1El.auto.textContent = "停止 ⏸";
    t1.autoTimer = setInterval(() => {
      if (t1.stepIndex >= t1.effectiveSteps.length) return t1Stop();
      t1AdvanceToChosen();
    }, 1100);
  }
  function t1Stop() {
    if (t1.autoTimer) clearInterval(t1.autoTimer);
    t1.autoTimer = null;
    t1El.auto.textContent = "自動再生 ⏵";
  }

  function t1RollDice() {
    if (t1.stepIndex >= t1.effectiveSteps.length) return;
    const step = t1.effectiveSteps[t1.stepIndex];
    const tempered = temper(step.candidates.map(c => c.prob), t1.temperature);
    const picked = weightedSampleIndex(tempered);
    t1RenderCandidates({ flashedIdx: picked });
    if (t1.flashTimer) clearTimeout(t1.flashTimer);
    t1.flashTimer = setTimeout(() => {
      t1.flashTimer = null;
      t1RenderCandidates();
    }, 1200);
  }

  // ====================================================================
  // タブ2: トークン分解
  // ====================================================================
  const t2El = {
    select:        document.getElementById("t2-text-select"),
    raw:           document.getElementById("t2-raw"),
    tokens:        document.getElementById("t2-tokens"),
    count:         document.getElementById("t2-count"),
    compareJa:     document.getElementById("t2-compare-ja"),
    compareJaCount:document.getElementById("t2-compare-ja-count"),
    compareEn:     document.getElementById("t2-compare-en"),
    compareEnCount:document.getElementById("t2-compare-en-count")
  };

  function t2Init() {
    data.tokenization.forEach((t, i) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = "[" + t.lang + "] " + t.text;
      if (i === 0) opt.selected = true;
      t2El.select.appendChild(opt);
    });
    t2El.select.addEventListener("change", () => {
      t2Render(data.tokenization.find(t => t.id === t2El.select.value));
    });
    const ja1 = data.tokenization.find(t => t.id === "ja-1");
    const en1 = data.tokenization.find(t => t.id === "en-1");
    if (ja1) {
      renderTokenChips(t2El.compareJa, ja1.tokens, { hideId: true });
      t2El.compareJaCount.innerHTML = '<strong>' + ja1.tokens.length + '</strong> 個のトークン';
    }
    if (en1) {
      renderTokenChips(t2El.compareEn, en1.tokens, { hideId: true });
      t2El.compareEnCount.innerHTML = '<strong>' + en1.tokens.length + '</strong> 個のトークン';
    }
    t2Render(data.tokenization[0]);
  }

  function t2Render(item) {
    t2El.raw.textContent = item.text;
    renderTokenChips(t2El.tokens, item.tokens, { hideId: false });
    t2El.count.innerHTML =
      'この文は <strong>' + item.tokens.length + '</strong> 個のトークンに分割されました。';
  }

  function renderTokenChips(container, tokens, opts) {
    container.innerHTML = "";
    const hideId = !!(opts && opts.hideId);
    tokens.forEach((t, idx) => {
      const chip = document.createElement("span");
      chip.className = "tok-chip";
      chip.dataset.i = (idx % 8).toString();
      const text = document.createElement("span");
      text.className = "tok-text";
      text.textContent = t.text.replace(/^ /, "▁");
      chip.appendChild(text);
      if (!hideId) {
        const id = document.createElement("span");
        id.className = "tok-id";
        id.textContent = "#" + t.id;
        chip.appendChild(id);
      }
      container.appendChild(chip);
    });
  }

  // ====================================================================
  // タブ3: 意味の地図(文脈モードあり)
  // ====================================================================
  const SVG_NS = "http://www.w3.org/2000/svg";

  const t3 = {
    catMap: {},
    groups: [],
    linkLayer: null,
    contextWords: [],   // 文脈語(word文字列の配列)
    hoverIdx: -1
  };

  const t3El = {
    map:        document.getElementById("t3-map"),
    legend:     document.getElementById("t3-legend"),
    hint:       document.getElementById("t3-hint"),
    ctxAdd:     document.getElementById("t3-context-add"),
    ctxReset:   document.getElementById("t3-context-reset"),
    ctxBag:     document.getElementById("t3-context-bag")
  };

  const meaningMap = { rendered: false, render: t3Render };

  function t3Render() {
    const mm = data.meaningMap;
    mm.categories.forEach(c => { t3.catMap[c.id] = c; });

    // 凡例
    t3El.legend.innerHTML = "";
    mm.categories.forEach(c => {
      const item = document.createElement("span");
      item.className = "t3-legend-item";
      item.innerHTML =
        '<span class="t3-legend-dot" style="background:' + c.color + ';color:' + c.color + '"></span>' +
        escapeHtml(c.label);
      t3El.legend.appendChild(item);
    });

    // SVG クリア
    while (t3El.map.firstChild) t3El.map.removeChild(t3El.map.firstChild);

    // グリッド
    const grid = document.createElementNS(SVG_NS, "g");
    grid.setAttribute("class", "grid");
    for (let i = 10; i < 100; i += 10) {
      const v = document.createElementNS(SVG_NS, "line");
      v.setAttribute("x1", i); v.setAttribute("x2", i);
      v.setAttribute("y1", 0); v.setAttribute("y2", 100);
      if (i === 50) v.setAttribute("class", "axis");
      grid.appendChild(v);
      const h = document.createElementNS(SVG_NS, "line");
      h.setAttribute("y1", i); h.setAttribute("y2", i);
      h.setAttribute("x1", 0); h.setAttribute("x2", 100);
      if (i === 50) h.setAttribute("class", "axis");
      grid.appendChild(h);
    }
    t3El.map.appendChild(grid);

    const linkLayer = document.createElementNS(SVG_NS, "g");
    linkLayer.setAttribute("class", "links");
    t3El.map.appendChild(linkLayer);
    t3.linkLayer = linkLayer;

    const wordLayer = document.createElementNS(SVG_NS, "g");
    wordLayer.setAttribute("class", "words");
    t3El.map.appendChild(wordLayer);

    t3.groups = [];
    mm.words.forEach((w, i) => {
      const g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("class", "word-group");
      g.dataset.i = i;
      const color = (t3.catMap[w.category] || {}).color || "#888";

      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("class", "word-dot");
      dot.setAttribute("cx", w.x);
      dot.setAttribute("cy", w.y);
      dot.setAttribute("r", 1.6);
      dot.setAttribute("fill", color);
      dot.setAttribute("data-color", color);

      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("class", "word-label");
      label.setAttribute("x", w.x);
      label.setAttribute("y", w.y - 2.4);
      label.setAttribute("text-anchor", "middle");
      label.textContent = w.word;

      g.appendChild(dot);
      g.appendChild(label);
      wordLayer.appendChild(g);

      const onEnter = () => t3Hover(i);
      const onLeave = () => t3Unhover();
      const onTap = (e) => { e.stopPropagation(); t3Hover(i); };
      g.addEventListener("mouseenter", onEnter);
      g.addEventListener("mouseleave", onLeave);
      g.addEventListener("click", onTap);
      g.addEventListener("touchstart", onTap, { passive: true });

      t3.groups.push(g);
    });

    t3El.map.addEventListener("click", t3Unhover);

    // 文脈追加プルダウンを初期化
    t3PopulateContextSelect();
    t3El.ctxAdd.addEventListener("change", () => {
      const v = t3El.ctxAdd.value;
      if (v) {
        t3AddContext(v);
        t3El.ctxAdd.value = "";
      }
    });
    t3El.ctxReset.addEventListener("click", () => {
      t3.contextWords = [];
      t3UpdatePositions();
      t3RenderContextBag();
      t3PopulateContextSelect();
    });

    meaningMap.rendered = true;
  }

  function t3PopulateContextSelect() {
    const sel = t3El.ctxAdd;
    while (sel.firstChild) sel.removeChild(sel.firstChild);
    const ph = document.createElement("option");
    ph.value = ""; ph.textContent = "+ 文脈に語を追加";
    sel.appendChild(ph);
    data.meaningMap.words.forEach(w => {
      if (t3.contextWords.includes(w.word)) return;
      const opt = document.createElement("option");
      opt.value = w.word; opt.textContent = w.word + " (" + (t3.catMap[w.category]||{}).label + ")";
      sel.appendChild(opt);
    });
  }

  function t3RenderContextBag() {
    t3El.ctxBag.innerHTML = "";
    t3.contextWords.forEach(word => {
      const chip = document.createElement("span");
      chip.className = "t3-ctx-chip";
      chip.innerHTML = escapeHtml(word) + " <button aria-label='remove'>×</button>";
      chip.querySelector("button").addEventListener("click", () => {
        t3.contextWords = t3.contextWords.filter(w => w !== word);
        t3UpdatePositions();
        t3RenderContextBag();
        t3PopulateContextSelect();
      });
      t3El.ctxBag.appendChild(chip);
    });
  }

  function t3AddContext(word) {
    if (t3.contextWords.includes(word)) return;
    t3.contextWords.push(word);
    t3UpdatePositions();
    t3RenderContextBag();
    t3PopulateContextSelect();
  }

  // 文脈に応じて各単語の位置を再計算してアニメ移動
  function t3UpdatePositions() {
    const mm = data.meaningMap;
    const ctxWords = t3.contextWords.map(w => mm.words.find(x => x.word === w)).filter(Boolean);
    const ctxCats = new Set(ctxWords.map(w => w.category));

    // 文脈が空 → 元位置へ戻す
    if (ctxWords.length === 0) {
      mm.words.forEach((w, i) => {
        const g = t3.groups[i];
        g.classList.remove("context");
        const dot = g.querySelector(".word-dot");
        const label = g.querySelector(".word-label");
        dot.setAttribute("cx", w.x);
        dot.setAttribute("cy", w.y);
        label.setAttribute("x", w.x);
        label.setAttribute("y", w.y - 2.4);
      });
      t3El.hint.innerHTML = "単語をタップ／ホバーすると、意味の近い 3 語が線でつながります。";
      return;
    }

    // 文脈の重心
    const cx = ctxWords.reduce((s, w) => s + w.x, 0) / ctxWords.length;
    const cy = ctxWords.reduce((s, w) => s + w.y, 0) / ctxWords.length;

    mm.words.forEach((w, i) => {
      const g = t3.groups[i];
      const dot = g.querySelector(".word-dot");
      const label = g.querySelector(".word-label");
      const isContext = t3.contextWords.includes(w.word);
      g.classList.toggle("context", isContext);

      let nx = w.x, ny = w.y;
      if (isContext) {
        // 文脈そのものは動かさない(基準点)
      } else if (ctxCats.has(w.category)) {
        // 同カテゴリは文脈の重心に強く引き寄せる
        nx = w.x + 0.45 * (cx - w.x);
        ny = w.y + 0.45 * (cy - w.y);
      } else {
        // 他カテゴリは重心からわずかに離す(画面端方向へ)
        nx = w.x + 0.18 * (w.x - cx);
        ny = w.y + 0.18 * (w.y - cy);
      }
      // 0〜100 に丸める
      nx = Math.max(2, Math.min(98, nx));
      ny = Math.max(4, Math.min(98, ny));
      dot.setAttribute("cx", nx);
      dot.setAttribute("cy", ny);
      label.setAttribute("x", nx);
      label.setAttribute("y", ny - 2.4);
    });

    const cats = Array.from(ctxCats).map(c => (t3.catMap[c]||{}).label).filter(Boolean).join(", ");
    t3El.hint.innerHTML =
      "文脈 <strong>「" + escapeHtml(t3.contextWords.join("、")) + "」</strong> に引かれて、" +
      "同じカテゴリ(" + escapeHtml(cats) + ")の語が中心へ集まり、他の語は外へ広がります。";
  }

  function t3Hover(idx) {
    const mm = data.meaningMap;
    t3.hoverIdx = idx;
    // 現在(アニメ後の)位置を読む
    const positions = t3.groups.map(g => {
      const d = g.querySelector(".word-dot");
      return { x: parseFloat(d.getAttribute("cx")), y: parseFloat(d.getAttribute("cy")) };
    });
    const center = positions[idx];
    const dists = positions.map((p, i) => ({
      i, d: i === idx ? Infinity : Math.hypot(p.x - center.x, p.y - center.y)
    }));
    dists.sort((a, b) => a.d - b.d);
    const top3 = dists.slice(0, 3).map(o => o.i);

    t3.groups.forEach((g, i) => {
      g.classList.remove("active", "neighbor", "dim");
      if (i === idx) g.classList.add("active");
      else if (top3.includes(i)) g.classList.add("neighbor");
      else g.classList.add("dim");
    });

    while (t3.linkLayer.firstChild) t3.linkLayer.removeChild(t3.linkLayer.firstChild);
    top3.forEach(j => {
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("class", "link active");
      line.setAttribute("x1", center.x); line.setAttribute("y1", center.y);
      line.setAttribute("x2", positions[j].x); line.setAttribute("y2", positions[j].y);
      t3.linkLayer.appendChild(line);
    });

    const centerWord = mm.words[idx].word;
    t3El.hint.innerHTML =
      "<strong>「" + escapeHtml(centerWord) + "」</strong> に意味が近い 3 語: " +
      top3.map(j => escapeHtml(mm.words[j].word)).join(" / ");
  }

  function t3Unhover() {
    t3.hoverIdx = -1;
    t3.groups.forEach(g => g.classList.remove("active", "neighbor", "dim"));
    while (t3.linkLayer.firstChild) t3.linkLayer.removeChild(t3.linkLayer.firstChild);
    if (t3.contextWords.length === 0) {
      t3El.hint.innerHTML = "単語をタップ／ホバーすると、意味の近い 3 語が線でつながります。";
    } else {
      t3UpdatePositions(); // 文脈モードのヒントへ戻す
    }
  }

  // ====================================================================
  // タブ4: 両側から考える(BERT 風)
  // ====================================================================
  const t4El = {
    select:   document.getElementById("t4-select"),
    sentence: document.getElementById("t4-sentence"),
    left:     document.getElementById("t4-left"),
    both:     document.getElementById("t4-both"),
    note:     document.getElementById("t4-note")
  };

  function t4Init() {
    data.bert.forEach((b, i) => {
      const opt = document.createElement("option");
      opt.value = b.id;
      opt.textContent = b.title + " ― " + b.left + "○○" + b.right;
      if (i === 0) opt.selected = true;
      t4El.select.appendChild(opt);
    });
    t4El.select.addEventListener("change", () => {
      t4Render(data.bert.find(b => b.id === t4El.select.value));
    });
    t4Render(data.bert[0]);
  }

  function t4Render(b) {
    // 穴あき文
    t4El.sentence.innerHTML = "";
    const leftSpan = document.createElement("span");
    leftSpan.textContent = b.left;
    const mask = document.createElement("span");
    mask.className = "t4-mask";
    mask.textContent = "○○";
    const rightSpan = document.createElement("span");
    rightSpan.textContent = b.right;
    rightSpan.className = "t4-side-faint show";
    t4El.sentence.appendChild(leftSpan);
    t4El.sentence.appendChild(mask);
    t4El.sentence.appendChild(rightSpan);

    t4RenderRows(t4El.left, b.leftOnly);
    t4RenderRows(t4El.both, b.bidirectional);

    // 鋭さ(エントロピー)を比較してメモを書く
    const topL = b.leftOnly[0];
    const topB = b.bidirectional[0];
    t4El.note.innerHTML =
      "左だけだと「" + escapeHtml(topL.token) + "」が " + (topL.prob*100).toFixed(0) +
      "% — 他の候補も <strong>横並びで残っている</strong>。" +
      "両側を見ると同じ「" + escapeHtml(topB.token) + "」が " + (topB.prob*100).toFixed(0) +
      "% に <strong>突き抜けて</strong>、迷いが消えています。" +
      "右側の文脈が、左だけでは決められなかった選択を絞り込んだのです。";
  }

  function t4RenderRows(container, list) {
    container.innerHTML = "";
    // 元順(prob 降順前提)で描画。先頭は top クラスで強調。
    const sorted = list.slice().sort((a, b) => b.prob - a.prob);
    sorted.forEach((c, i) => {
      const row = document.createElement("div");
      row.className = "t4-row" + (i === 0 ? " top" : "");
      const tok = document.createElement("div");
      tok.className = "tok";
      tok.textContent = c.token;
      const bar = document.createElement("div");
      bar.className = "bar";
      const span = document.createElement("span");
      // 一旦 0%、再描画後にアニメーション
      span.style.width = "0%";
      bar.appendChild(span);
      const pct = document.createElement("div");
      pct.className = "pct";
      pct.textContent = (c.prob * 100).toFixed(1) + "%";
      row.appendChild(tok); row.appendChild(bar); row.appendChild(pct);
      container.appendChild(row);
      // 次フレームで幅を入れて滑らかにアニメ
      requestAnimationFrame(() => {
        span.style.width = (c.prob * 100).toFixed(2) + "%";
      });
    });
  }

  // ====================================================================
  // ユーティリティ
  // ====================================================================
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // ====================================================================
  // 起動
  // ====================================================================
  t1Init();
  t2Init();
  t4Init();
  // タブ3 は初回表示時に描画(SVG が hidden=true でサイズ 0 になるのを避ける)

  activateTab((location.hash || "#tab1").replace("#", ""), { updateHash: false });
})();
