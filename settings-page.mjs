export function createIslandSettingsCard(React, host) {
  const SKIN_OPTIONS = [
    { id: 'day-island', labelKey: 'skinDay' },
    { id: 'night-island', labelKey: 'skinNight' },
    { id: 'island-mascot', labelKey: 'skinMascot' },
  ];
  const INTRO_OPTIONS = [
    { id: 'island', labelKey: 'introIsland' },
    { id: 'mascot', labelKey: 'introMascot' },
  ];
  const DEFAULTS = { skin: 'day-island', introVisual: 'island' };

  function normalize(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    return {
      skin: SKIN_OPTIONS.some(o => o.id === source.skin) ? source.skin : DEFAULTS.skin,
      introVisual: INTRO_OPTIONS.some(o => o.id === source.introVisual) ? source.introVisual : DEFAULTS.introVisual,
    };
  }

  function translate(t, key, fallback) {
    if (typeof t === 'function') {
      const value = t(key);
      if (typeof value === 'string' && value.length > 0) return value;
    }
    return fallback;
  }

  const { useEffect, useState, createElement: h } = React;

  function Field({ label, options, value, disabled, onPick, t }) {
    return h('div', { className: 'island-field' },
      h('span', { className: 'island-field-label' }, label),
      h('div', { className: 'island-segmented', role: 'group' },
        options.map(option => h('button', {
          key: option.id,
          type: 'button',
          className: 'island-seg-option',
          'aria-pressed': value === option.id ? 'true' : 'false',
          disabled,
          onClick: () => onPick(option.id),
        }, translate(t, option.labelKey, option.id)))));
  }

  return function IslandThemeCard(props) {
    const t = props.t;
    const [base, setBase] = useState(undefined);
    const [draft, setDraft] = useState(undefined);
    const [touched, setTouched] = useState(false);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
      let alive = true;
      host.load().then(
        (config) => {
          if (!alive) return;
          const normalized = normalize(config);
          setBase(normalized);
          setDraft(normalized);
          setStatus('idle');
        },
        () => { if (alive) { setDraft({ ...DEFAULTS }); setStatus('loadFailed'); } },
      );
      return () => { alive = false; };
    }, []);

    const dirty = Boolean(touched && draft);
    const saving = status === 'saving';
    const failed = status === 'failed';
    const loadFailed = status === 'loadFailed';

    const pick = (field) => (id) => {
      setTouched(true);
      setDraft(prev => ({ ...normalize(prev), [field]: id }));
      if (failed || loadFailed) setStatus('idle');
    };

    const save = () => {
      if (!dirty || saving) return;
      const next = normalize(draft);
      setStatus('saving');
      host.save(next).then(
        (accepted) => {
          const normalized = normalize(accepted);
          setBase(normalized);
          setDraft(normalized);
          setTouched(false);
          setStatus('idle');
          host.applied?.(normalized);
        },
        () => setStatus('failed'),
      );
    };

    const discard = () => {
      setDraft(base ?? { ...DEFAULTS });
      setTouched(false);
      setStatus(base === undefined ? 'loadFailed' : 'idle');
    };

    return h('div', { className: 'island-card island-card--open' },
      h('div', { className: 'island-card-headtext' },
        h('span', { className: 'island-card-name' }, translate(t, 'title', 'ISLAND')),
        h('span', { className: 'island-card-desc' }, translate(t, 'description', 'Workbench skin and startup intro')),
        dirty ? h('span', { className: 'island-card-pending' }, translate(t, 'unsaved', 'Unsaved')) : null),
      h('div', { className: 'island-card-body' },
        draft === undefined ? null : [
          h(Field, {
            key: 'skin',
            label: translate(t, 'skinLabel', 'Workbench skin'),
            options: SKIN_OPTIONS,
            value: draft.skin,
            disabled: saving,
            onPick: pick('skin'),
            t,
          }),
          h(Field, {
            key: 'intro',
            label: translate(t, 'introLabel', 'Startup intro visual'),
            options: INTRO_OPTIONS,
            value: draft.introVisual,
            disabled: saving,
            onPick: pick('introVisual'),
            t,
          }),
        ],
        draft === undefined ? null : h('div', { className: 'island-card-foot' },
          failed ? h('p', { className: 'island-card-error', role: 'status' }, translate(t, 'saveFailed', 'Save failed')) : null,
          loadFailed ? h('p', { className: 'island-card-error', role: 'status' }, translate(t, 'loadFailed', 'Load failed; showing defaults')) : null,
          h('button', {
            type: 'button',
            className: 'island-card-discard',
            disabled: !dirty || saving,
            onClick: discard,
          }, translate(t, 'discard', 'Discard')),
          h('button', {
            type: 'button',
            className: 'island-card-save',
            disabled: !dirty || saving,
            onClick: save,
          }, translate(t, saving ? 'saving' : 'save', saving ? 'Saving…' : 'Save')))));
  };
}
