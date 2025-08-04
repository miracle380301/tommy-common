export type User = {
  id: string;
  name: string;
  email: string;
  google_access_token?: string;
};

export type FullFormData = {
  script: string;
  voice: {
    currentVoiceTab: "single" | "";
    selectedVoice:
    | "sexual-w"
    | "sexual-m"
    | "sexual-w-en"
    | "ko-KR-Chirp3-HD-Achernar"
    | "ko-KR-Chirp3-HD-Zephyr"
    | "ko-KR-Chirp3-HD-Umbriel"
    | "ko-KR-Chirp3-HD-Rasalgethi"
    | ""
  };
  image: {
    currentImageTab: "direct" | "keyword" | "input";
    inputKeyword: string;
    selectedKeyword:
        | "nature"
        | "space"
        | "seasons"
        | "city"
        | "animals"
        | "emotions"
        | "abstract"
        | "activities"
        | "special"
        | "story"
        | ""
    files: (File | null)[];
  };
  music: {
    currentMusicTab: "direct" | "keyword";
    selectedKeyword:
        | "guitar"
        | "relaxing"
        | "house"
        | "ambient"
        | "peaceful"
        | "piano"
        | "acoustic"
        | "instrumental"
        | "passionate"
        | "zen"
        | "dream"
        | "meditative"
        | "hypnotic"
        | "nature"                
        | "";
    file: File | null;
  };
  template: {
    template_option: string;
    highlightText: string;
  }
  upload: {
    currentUploadTab: "download" | "reserve";
    title: string;
    tags: string;
    description: string;
  };
  settings: {
    googleTtsFile: File | null;
    unsplashApiKey: string;
  };
};

export type FormProps = {
  data: FullFormData;
  setData: React.Dispatch<React.SetStateAction<FullFormData>>;
};

export type ScriptFromProps = {
  data: {script: string};
  setData: (val: {script: string}) => void
}

export type VoiceFormProps = {
  data: FullFormData["voice"];
  setData: (val: FullFormData["voice"]) => void
  //setData: React.Dispatch<React.SetStateAction<FullFormData["voice"]>>
}

export type ImageFormProps = {
  data: FullFormData["image"];
  setData: (val: FullFormData["image"]) => void
}

export type MusicFormProps = {
  data: FullFormData["music"];
  setData: (val: FullFormData["music"]) => void
}

export type TemplateFromProps = {
  data: FullFormData["template"]
  setData: (val: FullFormData["template"]) => void
}

export type UploadFromProps = {
  data: FullFormData["upload"]
  setData: (val: FullFormData["upload"]) => void
}

export type SettingsFormProps = {
  data: FullFormData["settings"];
  setData: (val: FullFormData["settings"]) => void;
}