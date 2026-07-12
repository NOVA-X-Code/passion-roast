const els = {
  passionName: document.getElementById("passionName"),
  dropzone: document.getElementById("dropzone"),
  dropzoneText: document.getElementById("dropzoneText"),
  fileInput: document.getElementById("fileInput"),
  preview: document.getElementById("preview"),
  submitBtn: document.getElementById("submitBtn"),
  status: document.getElementById("status"),
  resultCard: document.getElementById("resultCard"),
  scoreValue: document.getElementById("scoreValue"),
  diplomaTitle: document.getElementById("diplomaTitle"),
  roastText: document.getElementById("roastText"),
  verdictText: document.getElementById("verdictText"),
};

let selectedFile = null;

function setStatus(msg, type = "") {
  els.status.textContent = msg;
  els.status.className = "status " + type;
}

function updateSubmitState() {
  els.submitBtn.disabled = !(selectedFile && els.passionName.value.trim());
}

els.passionName.addEventListener("input", updateSubmitState);

els.dropzone.addEventListener("click", () => els.fileInput.click());

els.fileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

["dragover", "dragleave", "drop"].forEach((evt) => {
  els.dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    if (evt === "dragover") els.dropzone.classList.add("dragover");
    if (evt === "dragleave") els.dropzone.classList.remove("dragover");
    if (evt === "drop") {
      els.dropzone.classList.remove("dragover");
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    }
  });
});

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    setStatus("Please choose an image file.", "error");
    return;
  }
  selectedFile = file;
  const url = URL.createObjectURL(file);
  els.preview.src = url;
  els.preview.style.display = "block";
  els.dropzoneText.textContent = file.name;
  updateSubmitState();
}

els.submitBtn.addEventListener("click", async () => {
  if (!selectedFile) return;
  els.submitBtn.disabled = true;
  setStatus("The Passion Judge is examining the evidence...");
  els.resultCard.classList.remove("visible");

  try {
    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("passionName", els.passionName.value.trim());

    const res = await fetch("/api/roast", { method: "POST", body: formData });
    const data = await res.json();

    if (!data.ok) {
      setStatus(data.error || "Something went wrong.", "error");
      els.submitBtn.disabled = false;
      return;
    }

    const r = data.result;
    els.scoreValue.textContent = r.passion_score;
    els.diplomaTitle.textContent = "🎓 " + r.diploma_title;
    els.roastText.textContent = r.roast;
    els.verdictText.textContent = r.verdict;
    els.resultCard.classList.add("visible");
    setStatus("");
  } catch (err) {
    console.error(err);
    setStatus("Network error, please try again.", "error");
  } finally {
    els.submitBtn.disabled = false;
  }
});
