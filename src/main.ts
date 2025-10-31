import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { initLanguage, getString ,format} from "./lang";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	mySetting2: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	mySetting2: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		initLanguage(this.app);
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', getString("Sample_Plugin"), (_evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice(getString("This_is_a_notice"));
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText(getString("Status_Bar_Text"));

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: getString('id_1'),
			name: getString("name_1"),
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: getString('id_2'),
			name: getString("name_2"),
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection(getString("Sample_Editor_Command"));
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: getString('id_3'),
			name: getString("name_3"),
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log(getString("click"), evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log(getString("setInterval")), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText(getString("Woah"));
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// 第一个输入框
		const setting1 = new Setting(containerEl)
			.setName(getString("setting1_name"))
			.setDesc(format("setting1_desc", { value: this.plugin.settings.mySetting }))
			.addText(text =>
				text
					.setPlaceholder(getString("Enter_your_secret"))
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();

						// 更新描述（使用 format）
						setting1.setDesc(format("setting1_desc", { value }));
						setting2.setDesc(format("setting2_desc", {
							firstValue: value,
							secondValue: this.plugin.settings.mySetting2
						}));
					})
			);

		// 第二个输入框
		const setting2 = new Setting(containerEl)
			.setName(getString("setting2_name"))
			.setDesc(format("setting2_desc", {
				firstValue: this.plugin.settings.mySetting,
				secondValue: this.plugin.settings.mySetting2
			}))
			.addText(text =>
				text
					.setPlaceholder(getString("Enter_your_secret"))
					.setValue(this.plugin.settings.mySetting2)
					.onChange(async (value) => {
						this.plugin.settings.mySetting2 = value;
						await this.plugin.saveSettings();

						setting2.setDesc(format("setting2_desc", {
							firstValue: this.plugin.settings.mySetting,
							secondValue: value
						}));
					})
			);

		// 提交按钮
		setting2.addButton(btn =>
			btn
				.setButtonText(getString("submit_button"))
				.setCta()
				.onClick(() => {
					new Notice(format("notice_template", {
						first: this.plugin.settings.mySetting,
						second: this.plugin.settings.mySetting2
					}));
				})
		);
	}
}

