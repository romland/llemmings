/**
 * >>> Prompt: instructions/audio-samples.0001.txt
 * >>> Prompt: instructions/audio-samples.0002.txt
 * >>> Prompt: instructions/audio-samples.0003.txt
 * >>> Prompt: instructions/audio-samples.0004.txt
 * 
 * Human notes:
 * - A lot of these samples does not sound at all as the instrument they are posing as.
 *   There will be imminent updates, I just wanted to get a first version commited to
 *   repository for posterity.
 * - As with the audio-tracker, I know so little about musical notation and sound that
 *   this is just winging it -- I blame it all on the LLM!
 */
var AudioSamples = (function ()
{
	const audioCtx = new AudioContext();
	
	// Generate sound data for high hat
	function generateHighHat(len) {
		const bufferSize = audioCtx.sampleRate * len; // 100ms buffer
		const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
		const data = buffer.getChannelData(0);
		
		// Add fade-in and fade-out
		const fadeLength = audioCtx.sampleRate * 0.01; // 10ms fade
		for (let i = 0; i < buffer.length; i++) {
			if (i < fadeLength) {
				data[i] = Math.sin((i / fadeLength) * (Math.PI / 2)) * Math.random();
			} else if (i >= buffer.length - fadeLength) {
				data[i] = Math.sin(((buffer.length - i) / fadeLength) * (Math.PI / 2)) * Math.random();
			} else {
				data[i] = Math.random() * 0.5;
			}
		}
		
		console.log("High hat sound generated");
		return buffer;
	}
	
	function generateGuitar(note, octave, len = 0.25) {
		const bufferSize = audioCtx.sampleRate * len; // 2s buffer
		const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
		const data = buffer.getChannelData(0);
		
		// Add fade-in and fade-out
		const fadeLength = audioCtx.sampleRate * 0.1; // 100ms fade
		const frequency = getFrequencyFromNoteOctave(note, octave);
		const amplitude = 0.5;
		
		const noise = new Float32Array(bufferSize);
		for (let i = 0; i < bufferSize; i++) {
			noise[i] = amplitude * (Math.random() * 2 - 1);
		}
		
		for (let i = 0; i < buffer.length; i++) {
			const t = i / audioCtx.sampleRate;
			
			// Sine wave
			let sample = amplitude * Math.sin(2 * Math.PI * frequency * t);
			
			// Add noisy attack
			const attackTime = audioCtx.sampleRate * 0.005; // 5ms attack time
			if (i < attackTime) {
				const attackAmplitude = (i / attackTime) * amplitude;
				sample += attackAmplitude * noise[i];
			}
			
			// Add noisy decay
			const decayTime = audioCtx.sampleRate * 0.5; // 500ms decay time
			if (i >= attackTime && i < decayTime) {
				const decayAmplitude = (1 - (i - attackTime) / (decayTime - attackTime)) * amplitude;
				sample += decayAmplitude * noise[i];
			}
			
			// Add noisy release
			const releaseTime = audioCtx.sampleRate * 0.2; // 200ms release time
			if (i >= buffer.length - releaseTime) {
				const releaseAmplitude = (buffer.length - i) / releaseTime * amplitude;
				sample += releaseAmplitude * noise[i];
			}
			
			// Apply fade-in and fade-out
			if (i < fadeLength) {
				data[i] = sample * Math.sin((i / fadeLength) * (Math.PI / 2));
			} else if (i >= buffer.length - fadeLength) {
				data[i] = sample * Math.sin(((buffer.length - i) / fadeLength) * (Math.PI / 2));
			} else {
				data[i] = sample;
			}
		}
		
		console.log(`Guitar sound for ${note}-${octave} generated`);
		return buffer;
	}
	
	
	// Generate sound data for bass drum
	function generateBassDrum(len = 0.25) {
		const bufferSize = audioCtx.sampleRate * len; // 500ms buffer
		const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
		const data = buffer.getChannelData(0);
		
		// Add fade-in and fade-out
		const fadeLength = audioCtx.sampleRate * 0.02; // 20ms fade
		const frequency = 60; // C1 note
		const amplitude = 1;
		for (let i = 0; i < buffer.length; i++) {
			const t = i / audioCtx.sampleRate;
			const sample = amplitude * Math.exp(-10 * t) * Math.sin(2 * Math.PI * frequency * t);
			if (i < fadeLength) {
				data[i] = sample * Math.sin((i / fadeLength) * (Math.PI / 2));
			} else if (i >= buffer.length - fadeLength) {
				data[i] = sample * Math.sin(((buffer.length - i) / fadeLength) * (Math.PI / 2));
			} else {
				data[i] = sample;
			}
		}
		
		console.log("Bass drum sound generated");
		return buffer;
	}
	
	// Generate sound data for bass guitar
	function generateBassGuitar(note, octave, len = 0.25) {
		const bufferSize = audioCtx.sampleRate * len;
		const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
		const data = buffer.getChannelData(0);
		
		const frequency = getFrequencyFromNoteOctave(note, octave);
		const amplitude = 0.5;
		const harmonicCount = 4;
		
		// Add harmonics using noise
		for (let i = 0; i < buffer.length; i++) {
			let sample = 0;
			const t = i / audioCtx.sampleRate;
			for (let j = 1; j <= harmonicCount; j++) {
				const harmonicFreq = frequency * j;
				const harmonicAmp = amplitude / j;
				sample += Math.sin(2 * Math.PI * harmonicFreq * t) * harmonicAmp;
				sample += (Math.random() * 1.2 - 1) * 0.1 * harmonicAmp;
			}
			data[i] = sample;
		}
		
		console.log(`Bass guitar sound for ${note}-${octave} generated`);
		return buffer;
	}
	
	function generatePiano(note, octave, len = 0.25) {
		
		// Find the frequency of the note and octave
		const freq = notes.find(n => n.note === note).frequency * Math.pow(2, octave);
		
		// Compute the length in seconds
		const duration = len * 1000;
		const fadeDuration = duration * 0.1;
		
		// Create the audio buffer
		const channels = 2;
		const frameCount = audioCtx.sampleRate * duration / 1000;
		const fadeFrameCount = audioCtx.sampleRate * fadeDuration / 1000;
		const buffer = audioCtx.createBuffer(channels, frameCount, audioCtx.sampleRate);
		
		// Fill the buffer with data
		for (let channel = 0; channel < channels; channel++) {
			const data = buffer.getChannelData(channel);
			for (let i = 0; i < frameCount; i++) {
				let fadeIn = 1;
				let fadeOut = 1;
				if (i < fadeFrameCount) {
					fadeIn = i / fadeFrameCount;
				} else if (i > frameCount - fadeFrameCount) {
					fadeOut = (frameCount - i) / fadeFrameCount;
				}
				let t = i / audioCtx.sampleRate;
				data[i] = Math.sin(2 * Math.PI * freq * t) * Math.min(fadeIn, fadeOut);
			}
		}
		
		// Return the buffer
		return buffer;
	}
	
	const notes = [
		{note: "C", frequency: 16.35},
		{note: "C#", frequency: 17.32},
		{note: "D", frequency: 18.35},
		{note: "D#", frequency: 19.45},
		{note: "E", frequency: 20.6},
		{note: "F", frequency: 21.83},
		{note: "F#", frequency: 23.12},
		{note: "G", frequency: 24.5},
		{note: "G#", frequency: 25.96},
		{note: "A", frequency: 27.5},
		{note: "A#", frequency: 29.14},
		{note: "B", frequency: 30.87},
	];
	
	// Helper function to get frequency from note and octave
	function getFrequencyFromNoteOctave(note, octave) {
		const noteIndex = notes.findIndex(n => n.note === note);
		return notes[noteIndex].frequency * Math.pow(2, octave);
	}
	
	// Map to store all samples
	const samples = new Map();
	
	// Example on how to play an instrument's sample at a given octave, note
	function playSample(sampleKey) {
		if(!sampleKey) {
			return;
		}
		if(sampleKey.startsWith("HH") || sampleKey.startsWith("BD")) {
			sampleKey = sampleKey[0] + sampleKey[1] + "-" + sampleKey.split("-")[1];
		}
		
		if(!samples.has(sampleKey)) {
			throw "non existing sample: " + sampleKey;
		}
		const source = audioCtx.createBufferSource();
		source.buffer = samples.get(sampleKey);
		source.connect(audioCtx.destination);
		source.start();
		
		console.log(`Sample ${sampleKey} played`);
		return source;
	}
	
	const noteInstruments = new Map([
		["Guitar", "GU"],
		["BassGuitar", "BG"],
		["Piano", "PN"]
	]);
	
	function createSamplesPerInstrumentPerNotePerOctave(len = 0.25) {
		// Instruments with notes
		for(let instr of noteInstruments) {
			for(let note of notes) {
				for(let octave = 1; octave < 9; octave++) {
					let sound = `${instr[1]}-${octave}-${note.note}-${len}`;
					if(samples.has(sound)) {
						continue;
					}
					
					switch(instr[0]) {
						case "Guitar" : samples.set(sound, generateGuitar(note.note, octave, len)); break;
						case "BassGuitar" : samples.set(sound, generateBassGuitar(note.note, octave, len)); break;
						case "Piano" : samples.set(sound, generatePiano(note.note, octave, len)); break;
						default : throw "whut " + instr[0] + " " + octave + " " + note.note;
					}
					
				}
			}
		}
		
		// Note-less:
		if(!samples.has("HH-"+len)) samples.set("HH-"+len, generateHighHat(len));
		if(!samples.has("BD-"+len)) samples.set("BD-"+len, generateBassDrum(len));
	}
	
	// >>> Prompt: instructions/audio-convertToRealNote.0001.txt
	// Human: I have no idea what these things are actually called. It's pretty nifty that I don't need to.
	function convertToRealNote(note) {
		if(note.length === 1 || note[1].toLowerCase() !== "b") {
			return note;
		}
		const realNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
		
		// Extract the note letter and accidental (if any)
		const noteLetter = note.charAt(0);
		const accidental = note.charAt(1) === "#" ? "#" : "b";
		
		// Get the index of the note letter in the realNotes array
		const noteIndex = realNotes.indexOf(noteLetter);
		
		// Calculate the number of semitones to shift up or down based on the accidental
		const semitoneShift = accidental === "#" ? 1 : -1;
		
		// Calculate the index of the real note by shifting up or down semitones
		const realNoteIndex = (noteIndex + semitoneShift + 12) % 12;
		
		// Return the real note
		return realNotes[realNoteIndex];
	}
	
	
	function createSamples(sampleNames)
	{
		for(let i = 0; i < sampleNames.length; i++) {
			if(samples.has(sampleNames[i])) {
				console.warn("Duplicate sample. Likely due to faulty tune-samples definition by the LLM (samples should be unique in that array)");
				continue;
			}
			
			let [instrument, octave, note, len] = sampleNames[i].split("-");
			console.log("Generating", sampleNames[i]);
			
			if(instrument === "HH" || instrument === "BD") {
				len = parseFloat(octave);
				switch(instrument) {
					// TODO: these two will only ever have one note/octave, make sure tunes don't create more than one!
					case "BD" : samples.set(sampleNames[i], generateBassDrum(len)); break;
					case "HH" : samples.set(sampleNames[i], generateHighHat(len)); break;
					default : throw "unknown instrument " + instrument;
				}
			} else {
				// HUMAN: I have NO idea what I am doing... I read that this might be true:
				
				// HUMAN: Enable this when we've tested and read up a bit more on it
				//note = convertToRealNote(note);
				
				octave = parseInt(octave, 10);
				len = parseFloat(len);
				switch(instrument) {
					case "GU" : samples.set(sampleNames[i], generateGuitar(note, octave, len)); break;
					case "BG" : samples.set(sampleNames[i], generateBassGuitar(note, octave, len)); break;
					case "PN" : samples.set(sampleNames[i], generatePiano(note, octave, len)); break;
					default : throw "unknown instrument " + instrument;
				}
			}
		}
	}
	
	return {
		playSample : playSample,
		createSamples, createSamples
	}
})();
