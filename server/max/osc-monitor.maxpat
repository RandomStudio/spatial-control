{
	"patcher": {
		"fileversion": 1,
		"appversion": { "major": 9, "minor": 1, "revision": 4, "architecture": "x64", "modernui": 1 },
		"classnamespace": "box",
		"rect": [ 100.0, 100.0, 660.0, 360.0 ],
		"boxes": [
			{
				"box": {
					"id": "obj-1",
					"maxclass": "newobj",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [ "" ],
					"patching_rect": [ 40.0, 70.0, 110.0, 22.0 ],
					"text": "udpreceive 9000"
				}
			},
			{
				"box": {
					"id": "obj-2",
					"maxclass": "newobj",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [ 40.0, 150.0, 90.0, 22.0 ],
					"text": "print OSC-IN"
				}
			},
			{
				"box": {
					"id": "obj-3",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [ 170.0, 72.0, 420.0, 20.0 ],
					"text": "OSC in from Open Stage Control (UDP 9000) -- CNMAT [udpreceive]"
				}
			},
			{
				"box": {
					"id": "obj-4",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [ 40.0, 190.0, 560.0, 20.0 ],
					"text": "Drag the stage in the browser; expect e.g.  /source/1/azim 45  in the Max console."
				}
			}
		],
		"lines": [
			{ "patchline": { "destination": [ "obj-2", 0 ], "source": [ "obj-1", 0 ] } }
		],
		"dependency_cache": [],
		"autosave": 0
	}
}
