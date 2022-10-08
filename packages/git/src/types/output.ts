export interface IRepoOutput {
  id: number;
  name: string;
  url: string;
  source: any;
}

export interface IBranchOutput {
  name: string;
  commit_sha: string;
  source: any;
}

export interface ICommitOutput {
  sha: string;
  message: string;
  source: any;
}

export interface ICreateWebhookOutput {
  id: number;
  source: any;
}

export interface IGetWebhookOutput {
  id: number;
  url: string;
  source: any;
}

export interface IUpdateWebhookOutput {
  source: any;
}

export interface IDeleteWebhookOutput {
  source: any;
}