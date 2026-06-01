(function () {
  "use strict";

  const data = window.APP_DATA;
  if (!data) {
    console.error("APP_DATA is missing. data.js を読み込んでください。");
    return;
  }

  // ====================================================================
  // タブ切り替え
  // ====================================================================
  const tabButtons = document.querySelectorAll(".tab");
  const panels = {
    tab1: document.getElementById("tab1"),
    tab2: document.getElementById("tab2"),
    tab3: document.getElementById("tab3")
  };

  function activateTab(name, opts) {
    if (!panels[name]) name = "tab1";
    tabButtons.forEach(btn => {
      const on = btn.dataset.tab === name;
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    Object.keys(panels).forEach(k => {
      panels[k].hidden = (k !== name);
    });
    if (!opts || opts.updateHash !== false) {
      const newHash = "#" + name;
      if (location.hash !== newHash) {
        history.replaceState(null, "", newHash);
      }
    }
    if (name === "tab3" && !meaningMap.rendered) {
      meaningMap.render();
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tab));
  });
  window.addEventListener("hashchange", () => {
    const tab = (location.hash || "#tab1").replace("#", "");
    activateTab(tab, { updateHash: false });
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
  // タブ1: 次の単語をあてる
  // ====================================================================
  const t1 = {
    sentence: null,
    stepIndex: 0,
    builtTokens: [],   // 確定済みの単語(prompt 部分は含めない)
    temperature: 1.0,
    autoTimer: null,
    flashTimer: null,
    flashRowEl: null
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
      t1Advance();
    });
    t1El.auto.addEventListener("click", () => t1ToggleAuto());
    t1El.dice.addEventListener("click", () => t1RollDice());
    t1El.reset.addEventListener("click", () => {
      t1Stop();
      t1LoadSentence(t1.sentence);
    });

    t1LoadSentence(data.sentences[0]);
  }

  function t1LoadSentence(s) {
    t1Stop();
    t1.sentence = s;
    t1.stepIndex = 0;
    t1.builtTokens = [];
    t1El.final.hidden = true;
    t1El.final.textContent = "";
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
    const finished = t1.stepIndex >= t1.sentence.steps.length;
    if (!finished) {
      const cur = document.createElement("span");
      cur.className = "t1-cursor";
      el.appendChild(cur);
    }
  }

  function t1RenderCandidates(opts) {
    const stepIdx = t1.stepIndex;
    const finished = stepIdx >= t1.sentence.steps.length;
    t1El.candidates.innerHTML = "";

    if (finished) {
      const full = t1.sentence.prompt + t1.builtTokens.join("");
      t1El.final.hidden = false;
      t1El.final.innerHTML =
        "<strong>完成: </strong>" + escapeHtml(full) +
        "<br><br>LLM はこの「次の 1 語を確率で選ぶ」作業を、" +
        "何千億回と学んだ知識をもとに猛烈な速さで繰り返しているだけです。";
      return;
    }
    t1El.final.hidden = true;

    const step = t1.sentence.steps[stepIdx];
    const baseProbs = step.candidates.map(c => c.prob);
    const tempered = temper(baseProbs, t1.temperature);

    // 表示順は基準確率の降順で固定(温度で順序が変わると目がチカチカする)
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
      if (c.token === step.chosen) row.classList.add("chosen");
      if (i === flashedIdx) row.classList.add("flashed");

      const tokDiv = document.createElement("div");
      tokDiv.className = "cand-token";
      tokDiv.innerHTML =
        '<span>' + escapeHtml(c.token) + '</span>' +
        (c.token === step.chosen ? '<span class="marker" title="この見本の正解パス">⬅</span>' : '');

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
      t1El.candidates.appendChild(row);

      if (i === flashedIdx) t1.flashRowEl = row;
    });
  }

  function t1Advance() {
    if (t1.stepIndex >= t1.sentence.steps.length) {
      t1Stop();
      return;
    }
    const step = t1.sentence.steps[t1.stepIndex];
    t1.builtTokens.push(step.chosen);
    t1.stepIndex += 1;
    const justAddedIdx = t1.builtTokens.length - 1;
    t1RenderSentence({ justAddedIdx });
    t1RenderCandidates();

    if (t1.stepIndex >= t1.sentence.steps.length) {
      t1El.next.disabled = true;
      t1El.dice.disabled = true;
      if (t1.autoTimer) t1Stop();
    }
  }

  function t1ToggleAuto() {
    if (t1.autoTimer) {
      t1Stop();
      return;
    }
    if (t1.stepIndex >= t1.sentence.steps.length) {
      t1LoadSentence(t1.sentence);
    }
    t1El.auto.textContent = "停止 ⏸";
    t1.autoTimer = setInterval(() => {
      if (t1.stepIndex >= t1.sentence.steps.length) {
        t1Stop();
        return;
      }
      t1Advance();
    }, 1100);
  }

  function t1Stop() {
    if (t1.autoTimer) clearInterval(t1.autoTimer);
    t1.autoTimer = null;
    t1El.auto.textContent = "自動再生 ⏵";
  }

  function t1RollDice() {
    if (t1.stepIndex >= t1.sentence.steps.length) return;
    const step = t1.sentence.steps[t1.stepIndex];
    const baseProbs = step.candidates.map(c => c.prob);
    const tempered = temper(baseProbs, t1.temperature);
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
  const t2 = { current: null };
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
      const item = data.tokenization.find(t => t.id === t2El.select.value);
      t2Render(item);
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
    t2.current = item;
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
      // 半角スペースが先頭にあれば見える形(▏)に置き換える
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
  // タブ3: 意味の地図
  // ====================================================================
  const meaningMap = {
    rendered: false,
    render: t3Render
  };

  const t3El = {
    map:    document.getElementById("t3-map"),
    legend: document.getElementById("t3-legend"),
    hint:   document.getElementById("t3-hint")
  };

  const SVG_NS = "http://www.w3.org/2000/svg";

  function t3Render() {
    const mm = data.meaningMap;
    const catMap = {};
    mm.categories.forEach(c => { catMap[c.id] = c; });

    // 凡例
    t3El.legend.innerHTML = "";
    mm.categories.forEach(c => {
      const item = document.createElement("span");
      item.className = "t3-legend-item";
      item.innerHTML =
        '<span class="t3-legend-dot" style="background:' + c.color + '"></span>' +
        escapeHtml(c.label);
      t3El.legend.appendChild(item);
    });

    // SVG クリア
    while (t3El.map.firstChild) t3El.map.removeChild(t3El.map.firstChild);

    // 薄いグリッド
    const grid = document.createElementNS(SVG_NS, "g");
    grid.setAttribute("class", "grid");
    for (let i = 10; i < 100; i += 10) {
      const v = document.createElementNS(SVG_NS, "line");
      v.setAttribute("x1", i); v.setAttribute("x2", i);
      v.setAttribute("y1", 0); v.setAttribute("y2", 100);
      grid.appendChild(v);
      const h = document.createElementNS(SVG_NS, "line");
      h.setAttribute("y1", i); h.setAttribute("y2", i);
      h.setAttribute("x1", 0); h.setAttribute("x2", 100);
      grid.appendChild(h);
    }
    t3El.map.appendChild(grid);

    // リンク用レイヤ
    const linkLayer = document.createElementNS(SVG_NS, "g");
    linkLayer.setAttribute("class", "links");
    t3El.map.appendChild(linkLayer);

    // 単語レイヤ
    const wordLayer = document.createElementNS(SVG_NS, "g");
    wordLayer.setAttribute("class", "words");
    t3El.map.appendChild(wordLayer);

    const wordGroups = [];

    mm.words.forEach((w, i) => {
      const g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("class", "word-group");
      g.dataset.i = i;

      const c = catMap[w.category];
      const color = c ? c.color : "#888";

      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("class", "word-dot");
      dot.setAttribute("cx", w.x);
      dot.setAttribute("cy", w.y);
      dot.setAttribute("r", 1.6);
      dot.setAttribute("fill", color);

      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("class", "word-label");
      label.setAttribute("x", w.x);
      label.setAttribute("y", w.y - 2.4);
      label.setAttribute("text-anchor", "middle");
      label.textContent = w.word;

      g.appendChild(dot);
      g.appendChild(label);
      wordLayer.appendChild(g);

      const hit = (e) => { e.stopPropagation(); t3Highlight(i, wordGroups, linkLayer, mm.words); };
      g.addEventListener("mouseenter", () => t3Highlight(i, wordGroups, linkLayer, mm.words));
      g.addEventListener("mouseleave", () => t3ClearHighlight(wordGroups, linkLayer));
      g.addEventListener("click", hit);
      g.addEventListener("touchstart", hit, { passive: true });

      wordGroups.push(g);
    });

    // 背景タップで解除
    t3El.map.addEventListener("click", () => t3ClearHighlight(wordGroups, linkLayer));

    meaningMap.rendered = true;
  }

  function t3Highlight(idx, groups, linkLayer, words) {
    const center = words[idx];
    const dists = words.map((w, i) => ({
      i,
      d: i === idx ? Infinity : Math.hypot(w.x - center.x, w.y - center.y)
    }));
    dists.sort((a, b) => a.d - b.d);
    const top3 = dists.slice(0, 3).map(o => o.i);

    groups.forEach((g, i) => {
      g.classList.remove("active", "neighbor", "dim");
      if (i === idx) g.classList.add("active");
      else if (top3.includes(i)) g.classList.add("neighbor");
      else g.classList.add("dim");
    });

    // リンク描画
    while (linkLayer.firstChild) linkLayer.removeChild(linkLayer.firstChild);
    top3.forEach(j => {
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("class", "link active");
      line.setAttribute("x1", center.x);
      line.setAttribute("y1", center.y);
      line.setAttribute("x2", words[j].x);
      line.setAttribute("y2", words[j].y);
      linkLayer.appendChild(line);
    });

    t3El.hint.textContent =
      "「" + center.word + "」に意味が近い 3 語: " +
      top3.map(j => words[j].word).join(" / ");
  }

  function t3ClearHighlight(groups, linkLayer) {
    groups.forEach(g => g.classList.remove("active", "neighbor", "dim"));
    while (linkLayer.firstChild) linkLayer.removeChild(linkLayer.firstChild);
    t3El.hint.textContent =
      "単語をタップ／ホバーすると、意味の近い 3 語が線でつながります。";
  }

  // ====================================================================
  // ユーティリティ
  // ====================================================================
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ====================================================================
  // 起動
  // ====================================================================
  t1Init();
  t2Init();

  const initialTab = (location.hash || "#tab1").replace("#", "");
  activateTab(initialTab, { updateHash: false });
})();
