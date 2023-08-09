import { getThings, postThing } from "../lib/apiUtils.js";
import FiveEPlayerSheet from "../components/5ePlayerSheet.js";

class InitSheet {
  constructor() {
    this.appComponent = document.getElementById("app");
    this.elem = document.createElement("div");
    this.appComponent.appendChild(this.elem);
    this.init();
  }

  init = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("id");
    // get player sheet data
    const generalData = await getThings(`/api/get_5e_character_general/${id}`);
    // handle invite
    // don't allow owner to become a playerUser of their own sheet
    if (USERID != generalData.user_id) {
      const invite = searchParams.get("invite");
      if (invite) {
        const inviteValid = await getThings(
          `/api/get_player_invite_by_uuid/${invite}`
        );
        if (inviteValid) {
          // check if user is already a playerUser
          const playerUser = await getThings(
            `/api/get_player_user_by_user_and_player/${id}`
          );
          if (!playerUser) {
            await postThing("/api/add_player_user", { player_id: id });
          }
          // clean params
          searchParams.delete("invite");
          const newRelativePathQuery =
            window.location.pathname + "?" + searchParams.toString();
          history.replaceState(null, "", newRelativePathQuery);
        } else {
          window.alert("Invalid invite link");
          window.location.pathname = "/";
        }
      }
    }

    new FiveEPlayerSheet({
      domComponent: this.elem,
      params: { content: generalData },
    });
    // stop initial spinner
    document.getElementById("initial-spinner").remove();
  };
}

new InitSheet();
