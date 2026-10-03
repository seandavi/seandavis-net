---
title: "Infrastructure-as-Code: Building the Bioconductor Conference AMI With Packer"
date: 2018-07-19
archived: true
aliases:
  - /post/2018-07-19-infrastructure-as-code-building-the-bioconductor-conference-ami-with-packer/
  - /post/2018/07/2018-07-19-infrastructure-as-code-building-the-bioconductor-conference-ami-with-packer/
  - /2018/07/infrastructure-as-code-building-the-bioconductor-conference-ami-with-packer/
---

One of the main features of the annual [Bioconductor Conference](https://bioc2018.bioconductor.org) is the proportion of time spent working with code in the form of [workshops](https://github.com/bioconductor/BiocWorkshops). To support these workshops, we ask workshop presenters to supply [Rmarkdown](https://rmarkdown.rstudio.com/) materials which we collate into workshop materials. Using literate programming approaches like Rmarkdown ensures that the workflows are self-consistent and work as expected.

In addition to the Rmarkdown workshop materials, we also need a consistent computing environment that can support reasonably large computation, provide high-performance network and file system access, and is essentially unlimited in scale (we expect to have \>150 participants, each with his/her own machine). To do so, we use [Amazon Web Services EC2](https://aws.amazon.com/ec2). The EC2 system allows us to prepare a [Amazon machine “image”](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html), or AMI, that contains the operating system, libraries, the newest version of R, and all packages needed for the workshops. In the past, creating the “image” was a manual process. This year, thanks to the work of the workshop organizers, we had a single DESCRIPTION file that contained all the necessary packages, allowing us to automate the process of building and keeping updated the AMI that would be used by all participants.

The [Packer project](https://www.packer.io/) is an open source tool for creating identical machine images for multiple platforms from a single source configuration. Packer is lightweight, runs on every major operating system, and is highly performant, creating machine images for multiple platforms in parallel. In this context, a machine image is a single static unit that contains a pre-configured operating system and installed software which is used to quickly create new running machines. Machine image formats change for each platform. Some examples include AMIs for EC2, VMDK/VMX files for VMware, OVF exports for VirtualBox, etc.

Biocoductor is cloud-ready and maintains [basic AMIs for Bioconductor](https://bioconductor.org/help/bioconductor-cloud-ami/). Rather than needing to start with a generic Linux AMI as the “base” for our Bioconductor conference AMI, I will use the most recent [Bioc-devel AMI](https://bioconductor.org/help/bioconductor-cloud-ami/#ami_ids) as the base. Packer uses a [json format file](https://www.packer.io/intro/getting-started/build-image.html#the-template) to describe, *in code*, the AMI that we want to build. The file for building the image is listed below in its entirety. The current version of the packer json file is available in this [github repo](https://github.com/seandavi/terraform-can/tree/master/packer).

To build the image, first [set up AWS authentication](https://www.packer.io/docs/builders/amazon.html#authentication) as outlined on the packer website. If you do not have an AWS account, you will not be able to actually build the AMI. Next, [install packer](https://www.packer.io/intro/getting-started/install.html) and ensure that it is in the path. Finally, save the file below as, for example, `bioc_2018.json`. In the directory containing the json file, execute packer:

``` sh
packer build bioc_2018.json
```

This build takes quite some time (perhaps 20 minutes or so).

In terms of details, briefly, the `instance_type` below was chosen to allow multicore installation using 16 threads. AWS \[spot pricing\] is used to minimize costs (see `spot_pricing` and `spot_pricing_auto_product` below). Adding the `ami_groups` set to `all` will enable public access to the AMI. The `source_ami_filter` section below chooses the “base” image. In this case, I used the AMI `name` and specified that the AMI was “owned” by the Bioconductor organization (`"owners": ["555219204010"]`). I set the disk size to 128GB of SSD storage in the `launch_block_device_mappings`.

The real work is done in the `provisioners` block. In this case, the provisioner block specifies just two shell commands that install the necessary packages. Note that the installation of the “Bioconductor/Biocworkshops” github package will install all packages in the [DESCRIPTION](https://github.com/Bioconductor/BiocWorkshops/blob/master/DESCRIPTION) file. The final line of the packer output will list the AMI ID that can be shared with others (since we made it public). The AMI may take a few minutes to become fully public.

``` js
{
    "variables": {
        "profile": "default",
        "region":  "us-east-1"
    },
    "builders": [
        {
            "access_key": "{{user `aws_access_key`}}",
            "ami_name": "Bioconductor_Conference_2018-{{timestamp}}",
            "instance_type": "c5.4xlarge",
            "region": "us-east-1",
            "secret_key": "{{user `aws_secret_key`}}",
            "source_ami_filter": {
                "filters": {
                    "virtualization-type": "hvm",
                    "name": "Bioc 3.8 R 3.5.1",
                    "root-device-type": "ebs"
                },
                "owners": ["555219204010"],
                "most_recent": true
            },
            "ssh_username": "ubuntu",
            "spot_price": "auto",
            "spot_price_auto_product": "Linux/UNIX",
            "type": "amazon-ebs",
            "ami_groups": ["all"],
            "launch_block_device_mappings": [
                {
                    "device_name": "/dev/sda1",
                    "volume_size": 128,
                    "volume_type": "gp2",
                    "delete_on_termination": true
                }
            ]
        }
    ],
    "provisioners": [
        {
            "type": "shell",
            "inline":[
                "Rscript -e 'BiocManager::install(\"remotes\")'",
                "Rscript -e 'options(Ncpus=16); BiocManager::install(\"Bioconductor/BiocWorkshops\")'",
            ]
        }
    ]
}
    
```

By maintaining the AMI description as code, we can ensure that the AMI is fully reproducible (no manual installations, etc.) and, therefore, highly reproducible and even reusable.

[The current version of the packer file is available on github](https://github.com/seandavi/terraform-can/tree/master/packer). Thanks to Levi Waldron, Lori Shepherd, Marcel Ramos, Martin Morgan, and multiple workshop authors for their contributions.
