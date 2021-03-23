(
SuperDirt.postBadValues = false;

s.options.device_("BlackHole 16ch");
s.options.numBuffers = 1024 * 16;
s.options.memSize = 8192 * 16;
s.options.maxNodes = 1024 * 64;
s.options.numOutputBusChannels = 8;
s.options.numInputBusChannels = 0;

s.waitForBoot {
	~dirt = SuperDirt(2, s);
	~dirt.loadSoundFiles("~/studio/days/samples/*");
	~dirt.loadSoundFiles("~/studio/samples/*");
	s.sync;
	~dirt.start(57120, [0,2,4,6]);
};
s.latency = 0;
);

