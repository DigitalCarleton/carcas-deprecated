# This script generates the html file for each bone

import re
import os

from collections import namedtuple

# get the names of all model files (in carcas/carcas-models/models)
model_dir = os.path.join("carcas-models/models")
bone_filenames = os.listdir(model_dir)

# create a tuple with required variations for each bone
Bone = namedtuple('Bone', 'bone_name bone_model_path bone_string')

bones = []
for bone_filename in bone_filenames:
    bone_path = os.path.join("../carcas-models/models", bone_filename)
    bone_string = bone_filename[:-4] # remove .glb
    bone_name = bone_string.lower().replace(" ", "-")
    bones.append(Bone(bone_name, bone_path, bone_string))

# get the template
with open("utils/template.html") as f:
    template = f.read()
     
# create a new file for each bone and fill in the appropriate strings
for bone in bones:
    # replace the keywords in the template using regular expressions
    bone_id_filled = re.sub('bone-name', bone.bone_name, template)
    bone_model_filled = re.sub('bone-model-path', bone.bone_model_path, bone_id_filled)
    bone_alt_filled = re.sub('bone-string', bone.bone_string, bone_model_filled)

    template_filled = bone_alt_filled

    # save to a new file
    bone_html_file = open(f"html-files/{bone.bone_name}.html", "w")
    bone_html_file.write(template_filled)
    bone_html_file.close()

