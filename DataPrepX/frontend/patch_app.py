# One-off patch for App.jsx — run: python patch_app.py
from pathlib import Path

p = Path(__file__).resolve().parent / "src" / "App.jsx"
text = p.read_text(encoding="utf-8")

old = "    const email = (formData.email || '').trim().toLowerCase();\n    const password = formData.password || '';"
new = "    const email = (formData.email || '').trim().toLowerCase();\n    const password = String(formData.password if formData.password is not None else '');"
if old not in text:
    raise SystemExit("auth password block not found")
text = text.replace(old, new, 1)

if "const VIZ_LABELS" not in text:
    needle = "const API_BASE = 'http://localhost:5000/api';\n\naxios.interceptors"
    insert = """const API_BASE = 'http://localhost:5000/api';

const VIZ_LABELS = {
  missing_heatmap: 'Missing values heatmap',
  confidence_distribution: 'Confidence distribution',
  calibration_gauge: 'Calibration gauge',
  corrections_pie: 'Corrections by type',
  quality_metrics: 'Quality metrics',
};

axios.interceptors"""
    if needle not in text:
        raise SystemExit("API_BASE needle not found")
    text = text.replace(needle, insert, 1)

text = text.replace(
    "import React, { useState, useEffect, useCallback } from 'react';",
    "import React, { useState, useEffect, useCallback, useRef } from 'react';",
    1,
)

old = "  const [processError, setProcessError] = useState('');\n  const [loading, setLoading] = useState(false);"
new = "  const [processError, setProcessError] = useState('');\n  const [vizUrls, setVizUrls] = useState({});\n  const [vizError, setVizError] = useState('');\n  const [loading, setLoading] = useState(false);"
if old not in text:
    raise SystemExit("dashboard processError state not found")
text = text.replace(old, new, 1)

old = """      setProcessResults(null);
      setProcessError('');
    }
    setView(next);"""
new = """      setProcessResults(null);
      setProcessError('');
      setVizUrls({});
      setVizError('');
    }
    setView(next);"""
if old not in text:
    raise SystemExit("goView block not found")
text = text.replace(old, new, 1)

needle = "  }, [toast]);\n\n  const handleUpload = async"
hook = """  }, [toast]);

  const vizUrlsRef = useRef({});
  const revokeAllViz = () => {
    Object.values(vizUrlsRef.current).forEach((u) => {
      try {
        if (u) URL.revokeObjectURL(u);
      } catch (e) {
        void 0;
      }
    });
    vizUrlsRef.current = {};
  };

  useEffect(
    () => () => {
      revokeAllViz();
    },
    []
  );

  const loadVisualizationBlobs = async (jid) => {
    revokeAllViz();
    setVizError('');
    setVizUrls({});
    await axios.get(`${API_BASE}/visualizations/${jid}`);
    const gen = await axios.get(`${API_BASE}/visualizations/${jid}`);
    const paths = gen.data?.visualizations || {};
    const next = {};
    for (const key of Object.keys(paths)) {
      try {
        const res = await axios.get(`${API_BASE}/visualizations/file/${jid}/${key}`, {
          responseType: 'blob',
        });
        const url = URL.createObjectURL(res.data);
        next[key] = url;
        vizUrlsRef.current[key] = url;
      } catch (e) {
        debug.warn('viz', 'blob_failed', { key, message: e.message });
      }
    }
    setVizUrls(next);
  };

  const handleUpload = async"""
if needle not in text:
    raise SystemExit("toast/handleUpload needle not found")
text = text.replace(needle, hook, 1)

# Remove duplicate GET I mistakenly added
text = text.replace(
    "    await axios.get(`${API_BASE}/visualizations/${jid}`);\n    const gen = await axios.get(`${API_BASE}/visualizations/${jid}`);",
    "    const gen = await axios.get(`${API_BASE}/visualizations/${jid}`);",
    1,
)

old = """      setProcessResults(resultsPayload);
      debug.event('process', 'complete', {
        jobId,
        rows: resultsPayload.cleaned_shape?.[0] ?? resultsPayload.data?.length,
        steps: resultsPayload.steps?.length,
      });
      goView('results', 'after_process');
      setToast('Processing finished.');"""
new = """      setProcessResults(resultsPayload);
      debug.event('process', 'complete', {
        jobId,
        rows: resultsPayload.cleaned_shape?.[0] ?? resultsPayload.data?.length,
        steps: resultsPayload.steps?.length,
      });
      setLoadingMessage('Building charts…');
      try {
        await loadVisualizationBlobs(jobId);
      } catch (ve) {
        const vm = ve.response?.data?.error || ve.message || 'Could not load visualizations.';
        setVizError(String(vm));
        debug.warn('viz', 'generate_failed', { jobId, msg: vm });
      }
      goView('results', 'after_process');
      setToast('Processing finished.');"""
if old not in text:
    raise SystemExit("runProcessing block not found")
text = text.replace(old, new, 1)

anchor = "            {processResults?.steps?.length ? (\n              <div className=\"card overflow-hidden"
insert_before = """            {vizError ? (
              <div className="alert-error animate-fade-in-up">{vizError}</div>
            ) : null}

            {Object.keys(vizUrls).length > 0 ? (
              <div className="card border border-white/10 transition-shadow duration-500 hover:shadow-glow">
                <h3 className="mb-4 text-lg font-bold text-white">Charts &amp; diagnostics</h3>
                <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                  {Object.entries(vizUrls).map(([key, src]) => (
                    <figure
                      key={key}
                      className="overflow-hidden rounded-xl border border-white/10 bg-black/20 transition-transform duration-300 hover:border-emerald-400/30"
                    >
                      <figcaption className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-300/90">
                        {VIZ_LABELS[key] || key.replace(/_/g, ' ')}
                      </figcaption>
                      <img src={src} alt="" className="h-auto w-full object-contain" loading="lazy" />
                    </figure>
                  ))}
                </div>
              </div>
            ) : null}

"""
if anchor not in text:
    raise SystemExit("results anchor not found")
text = text.replace(anchor, insert_before + anchor, 1)

p.write_text(text, encoding="utf-8")
print("patched OK")
